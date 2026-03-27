import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslocoService } from '@jsverse/transloco';
import { firstValueFrom } from 'rxjs';
import { FlightProviderService } from '../../providers/flight-provider.service';
import { FlightProvider } from '../../models/flight-provider.model';
import { Airport } from '../../models/airport.model';
import { FlightFare } from '../../models/flight-fare.model';
import { FlightSearchParams } from '../../models/flight-search.model';
import {
  RyanairActiveAirport,
  RyanairRoundTripFaresResponse,
  RyanairLanguageCode,
} from './ryanair-api.types';
import { mapRyanairAirportToAirport, mapRyanairFareToFlightFare } from './ryanair.mapper';

@Injectable({ providedIn: 'root' })
export class RyanairService implements FlightProviderService {
  private readonly http = inject(HttpClient);
  private readonly transloco = inject(TranslocoService);

  readonly provider: FlightProvider = {
    id: 'ryanair',
    name: 'Ryanair',
    logoUrl: 'https://www.ryanair.com/favicon.ico',
    baseUrl: 'https://www.ryanair.com',
  };

  async getAirports(): Promise<Airport[]> {
    const apiLang = this.transloco.getActiveLang().startsWith('de') ? 'de' : 'en';
    const raw = await firstValueFrom(
      this.http.get<RyanairActiveAirport[]>(`/api/views/locate/5/airports/${apiLang}/active`)
    );
    return raw.map(mapRyanairAirportToAirport);
  }

  async searchFares(params: FlightSearchParams): Promise<FlightFare[]> {
    const allFares: FlightFare[] = [];

    const departures = params.departureAirportCodes.length > 0
      ? params.departureAirportCodes
      : [];
    const arrivals = params.arrivalAirportCodes.length > 0
      ? params.arrivalAirportCodes
      : [undefined];

    const requests: Promise<FlightFare[]>[] = [];

    for (const dep of departures) {
      for (const arr of arrivals) {
        if (arr && arr === dep) continue;
        requests.push(this.fetchFares(dep, arr, params));
      }
    }

    const results = await Promise.allSettled(requests);
    for (const result of results) {
      if (result.status === 'fulfilled') {
        allFares.push(...result.value);
      }
    }

    return allFares;
  }

  private async fetchFares(
    departureIata: string,
    arrivalIata: string | undefined,
    params: FlightSearchParams
  ): Promise<FlightFare[]> {
    const market = this.transloco.getActiveLang().startsWith('de')
      ? RyanairLanguageCode.GERMAN
      : RyanairLanguageCode.ENGLISH;

    const queryParams: Record<string, string | number> = {
      departureAirportIataCode: departureIata,
      outboundDepartureDateFrom: params.outboundDateFrom,
      outboundDepartureDateTo: params.outboundDateTo,
      inboundDepartureDateFrom: params.inboundDateFrom,
      inboundDepartureDateTo: params.inboundDateTo,
      durationFrom: params.durationFrom,
      durationTo: params.durationTo,
      market,
      adultPaxCount: params.adults ?? 1,
      outboundDepartureTimeFrom: '00:00',
      outboundDepartureTimeTo: '23:59',
      inboundDepartureTimeFrom: '00:00',
      inboundDepartureTimeTo: '23:59',
    };

    if (arrivalIata) {
      queryParams['arrivalAirportIataCode'] = arrivalIata;
    }
    if (params.outboundDepartureDaysOfWeek) {
      queryParams['outboundDepartureDaysOfWeek'] = params.outboundDepartureDaysOfWeek;
    }
    if (params.inboundDepartureDaysOfWeek) {
      queryParams['inboundDepartureDaysOfWeek'] = params.inboundDepartureDaysOfWeek;
    }

    const response = await firstValueFrom(
      this.http.get<RyanairRoundTripFaresResponse>('/api/farfnd/v4/roundTripFares', {
        params: queryParams,
      })
    );

    return response.fares.map(mapRyanairFareToFlightFare);
  }
}
