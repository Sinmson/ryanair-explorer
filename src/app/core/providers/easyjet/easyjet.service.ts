import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { FareAvailabilitySummary } from '../../models/fare-availability.model';
import { PublishedRouteDeal } from '../../models/published-route-deal.model';
import { EasyJetAvailabilityResponse } from './easyjet-api.types';
import { EasyJetFlightsSearchResponseWire } from './easyjet-flight-search.types';
import { mapEasyJetAvailabilityToSummary, mapEasyJetFlightsSearchToPublishedDeals } from './easyjet.mapper';

export interface EasyJetAvailabilityQuery {
  origin: string;
  destination: string;
  currency: string;
  isReturn: boolean;
  startDate: string;
  endDate: string;
  isWorldwide?: boolean;
}

/** Query for `GET …/ejcms/cache15m/api/flights/search` (published routes / “Veröffentlichung von Flügen”). */
export interface EasyJetFlightsSearchQuery {
  /** When true, omit `OriginIatas` / `PreferredOriginIatas` (search all origins). */
  allOrigins: boolean;
  /** When true, omit `DestinationIatas` / `PreferredDestinationIatas` (search all destinations). */
  allDestinations: boolean;
  assumedPassengersPerBooking: number;
  assumedSectorsPerBooking: number;
  creditCardFeePercent: number;
  currencyId: number;
  startDate: string;
  endDate: string;
  maxResults: number;
  /** Required when `allOrigins` is false — comma-separated IATA codes. */
  originIatas?: string;
  preferredOriginIatas?: string;
  /** Required when `allDestinations` is false — comma-separated IATA codes (mirrors `OriginIatas`). */
  destinationIatas?: string;
  preferredDestinationIatas?: string;
}

/** Dev proxy: `proxy.conf.json` maps `/api/easyjet` → https://www.easyjet.com (see pathRewrite). */
const EASYJET_API_PREFIX = '/api/easyjet';

@Injectable({ providedIn: 'root' })
export class EasyJetService {
  private readonly http = inject(HttpClient);

  /**
   * Homepage availability calendar (lowest price per day for outbound / return).
   * Maps the wire format to {@link FareAvailabilitySummary} (dates as local `Date`).
   */
  async getAvailability(query: EasyJetAvailabilityQuery): Promise<FareAvailabilitySummary> {
    const params: Record<string, string | boolean> = {
      origin: query.origin,
      destination: query.destination,
      currency: query.currency,
      isReturn: query.isReturn,
      startDate: query.startDate,
      endDate: query.endDate,
      isWorldwide: query.isWorldwide ?? false,
    };

    const raw = await firstValueFrom(
      this.http.get<EasyJetAvailabilityResponse>(`${EASYJET_API_PREFIX}/homepage/api/availability`, {
        params,
      })
    );

    return mapEasyJetAvailabilityToSummary(raw);
  }

  /**
   * CMS cached flight search (marketing / publication list). Same-origin XHR on easyjet.com
   * sends `X-Requested-With`; Akamai may still block dev-proxy calls without a full session.
   */
  async searchPublishedFlights(query: EasyJetFlightsSearchQuery): Promise<PublishedRouteDeal[]> {
    const params: Record<string, string | number | boolean> = {
      AllOrigins: query.allOrigins,
      AllDestinations: query.allDestinations,
      AssumedPassengersPerBooking: query.assumedPassengersPerBooking,
      AssumedSectorsPerBooking: query.assumedSectorsPerBooking,
      CreditCardFeePercent: query.creditCardFeePercent,
      CurrencyId: query.currencyId,
      StartDate: query.startDate,
      EndDate: query.endDate,
      MaxResults: query.maxResults,
    };

    if (!query.allOrigins && query.originIatas) {
      params['OriginIatas'] = query.originIatas;
      params['PreferredOriginIatas'] =
        query.preferredOriginIatas ?? query.originIatas.split(',')[0]?.trim() ?? query.originIatas;
    }

    if (!query.allDestinations && query.destinationIatas) {
      params['DestinationIatas'] = query.destinationIatas;
      params['PreferredDestinationIatas'] =
        query.preferredDestinationIatas ?? query.destinationIatas.split(',')[0]?.trim() ?? query.destinationIatas;
    }

    const headers = new HttpHeaders({
      'X-Requested-With': 'XMLHttpRequest',
      ...(typeof globalThis.crypto?.randomUUID === 'function'
        ? { 'X-Transaction-Id': globalThis.crypto.randomUUID() }
        : {}),
    });

    const raw = await firstValueFrom(
      this.http.get<EasyJetFlightsSearchResponseWire>(
        `${EASYJET_API_PREFIX}/ejcms/cache15m/api/flights/search`,
        { params, headers }
      )
    );

    return mapEasyJetFlightsSearchToPublishedDeals(raw);
  }
}
