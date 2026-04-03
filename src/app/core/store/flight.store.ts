import { computed, inject } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import {
  signalStore,
  withState,
  withComputed,
  withMethods,
  patchState,
} from '@ngrx/signals';
import { Airport } from '../models/airport.model';
import { FlightFare } from '../models/flight-fare.model';
import { FlightSearchParams } from '../models/flight-search.model';
import { PublishedRouteDeal } from '../models/published-route-deal.model';
import { EasyJetService } from '../providers/easyjet/easyjet.service';
import {
  easyJetPublishedSearchQueryFromFlightParams,
  sortPublishedDealsByPriceAndDate,
} from '../providers/easyjet/easyjet-published-search';
import { RyanairService } from '../providers/ryanair/ryanair.service';

/** Ryanair airport list API language segment (matches RyanairService.getAirports). */
function airportsApiLang(activeLang: string): 'en' | 'de' {
  return activeLang.startsWith('de') ? 'de' : 'en';
}

export type SortField = 'price' | 'departureDate' | 'duration' | 'departure' | 'arrival';
export type SortOrder = 'asc' | 'desc';

interface FlightState {
  airports: Airport[];
  /** Cached Ryanair airport lists per API language — avoids refetch + spinner when switching back. */
  airportsByApiLang: Record<string, Airport[]>;
  fares: FlightFare[];
  /** easyJet CMS “published” one-way rows (parallel to Ryanair round-trip fares). */
  easyJetDeals: PublishedRouteDeal[];
  /** True after a completed search (used for empty-state vs initial landing). */
  searched: boolean;
  loading: boolean;
  airportsLoading: boolean;
  error: string | null;
  sortField: SortField;
  sortOrder: SortOrder;
}

const initialState: FlightState = {
  airports: [],
  airportsByApiLang: {},
  fares: [],
  easyJetDeals: [],
  searched: false,
  loading: false,
  airportsLoading: false,
  error: null,
  sortField: 'price',
  sortOrder: 'asc',
};

export const FlightStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(store => ({
    sortedFares: computed(() => {
      const fares = [...store.fares()];
      const field = store.sortField();
      const order = store.sortOrder();

      fares.sort((a, b) => {
        let cmp = 0;
        switch (field) {
          case 'price':
            cmp = a.totalPrice - b.totalPrice;
            break;
          case 'departureDate':
            cmp = new Date(a.outbound.departureDate).getTime() - new Date(b.outbound.departureDate).getTime();
            break;
          case 'duration':
            cmp = a.tripDurationDays - b.tripDurationDays;
            break;
          case 'departure':
            cmp = a.outbound.departureAirport.name.localeCompare(b.outbound.departureAirport.name);
            break;
          case 'arrival':
            cmp = a.outbound.arrivalAirport.name.localeCompare(b.outbound.arrivalAirport.name);
            break;
        }
        return order === 'asc' ? cmp : -cmp;
      });

      return fares;
    }),
    hasResults: computed(() => store.fares().length > 0 || store.easyJetDeals().length > 0),
    fareCount: computed(() => store.fares().length),
    easyJetDealCount: computed(() => store.easyJetDeals().length),
  })),
  withMethods(store => {
    const ryanairService = inject(RyanairService);
    const easyJetService = inject(EasyJetService);
    const transloco = inject(TranslocoService);

    return {
      async loadAirports(): Promise<void> {
        const lang = airportsApiLang(transloco.getActiveLang());
        const cached = store.airportsByApiLang()[lang];
        if (cached?.length) {
          patchState(store, { airports: cached, airportsLoading: false });
          return;
        }

        patchState(store, { airportsLoading: true, error: null });
        try {
          const airports = await ryanairService.getAirports();
          patchState(store, {
            airports,
            airportsLoading: false,
            airportsByApiLang: { ...store.airportsByApiLang(), [lang]: airports },
          });
        } catch (e) {
          patchState(store, {
            airportsLoading: false,
            error: e instanceof Error ? e.message : 'Failed to load airports',
          });
        }
      },

      async search(params: FlightSearchParams): Promise<void> {
        patchState(store, { loading: true, error: null, fares: [], easyJetDeals: [] });

        const easyJetQuery = easyJetPublishedSearchQueryFromFlightParams(params);
        const easyJetPromise =
          easyJetQuery !== null
            ? easyJetService
                .searchPublishedFlights(easyJetQuery)
                .then(raw => sortPublishedDealsByPriceAndDate(raw))
                .catch(() => [] as PublishedRouteDeal[])
            : Promise.resolve([] as PublishedRouteDeal[]);

        let fares: FlightFare[] = [];
        let error: string | null = null;
        const faresPromise = ryanairService.searchFares(params).then(
          f => {
            fares = f;
          },
          e => {
            error = e instanceof Error ? e.message : 'Search failed';
          }
        );

        const easyJetDeals = await Promise.all([easyJetPromise, faresPromise]).then(([deals]) => deals);

        patchState(store, {
          fares,
          easyJetDeals,
          loading: false,
          error,
          searched: true,
        });
      },

      updateSort(field: SortField): void {
        const currentField = store.sortField();
        const currentOrder = store.sortOrder();
        if (currentField === field) {
          patchState(store, { sortOrder: currentOrder === 'asc' ? 'desc' : 'asc' });
        } else {
          patchState(store, { sortField: field, sortOrder: 'asc' });
        }
      },

      clearResults(): void {
        patchState(store, { fares: [], easyJetDeals: [], error: null, searched: false });
      },
    };
  })
);
