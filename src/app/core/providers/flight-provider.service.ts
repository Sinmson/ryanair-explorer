import { InjectionToken } from '@angular/core';
import { Airport } from '../models/airport.model';
import { FlightFare } from '../models/flight-fare.model';
import { FlightSearchParams } from '../models/flight-search.model';
import { FlightProvider } from '../models/flight-provider.model';

export interface FlightProviderService {
  readonly provider: FlightProvider;
  searchFares(params: FlightSearchParams): Promise<FlightFare[]>;
  getAirports(): Promise<Airport[]>;
}

export const FLIGHT_PROVIDER_SERVICES = new InjectionToken<FlightProviderService[]>('FLIGHT_PROVIDER_SERVICES');
