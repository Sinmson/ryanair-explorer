import { FlightSearchParams } from '../../models/flight-search.model';
import { PublishedRouteDeal } from '../../models/published-route-deal.model';
import type { EasyJetFlightsSearchQuery } from './easyjet.service';

/** CMS search returns a capped list; raise if you need more rows per request. */
export const EASYJET_PUBLISHED_SEARCH_MAX_RESULTS = 100;

function normalizeIatas(codes: string[]): string[] {
  return codes.map(c => c.trim().toUpperCase()).filter(Boolean);
}

/**
 * Maps home search params to the CMS `flights/search` query.
 *
 * Mirrors the browser pattern: `AllOrigins` / `AllDestinations` false when the user constrains
 * that axis; then `OriginIatas` / `DestinationIatas` (and preferred = first code) are sent.
 * Call only when at least one airport tag is set (same as the search button).
 */
export function easyJetPublishedSearchQueryFromFlightParams(
  params: FlightSearchParams
): EasyJetFlightsSearchQuery | null {
  const origins = normalizeIatas(params.departureAirportCodes);
  const destinations = normalizeIatas(params.arrivalAirportCodes);

  if (origins.length === 0 && destinations.length === 0) {
    return null;
  }

  const allOrigins = origins.length === 0;
  const allDestinations = destinations.length === 0;

  const base: EasyJetFlightsSearchQuery = {
    allOrigins,
    allDestinations,
    assumedPassengersPerBooking: 1,
    assumedSectorsPerBooking: 1,
    creditCardFeePercent: 0,
    currencyId: 0,
    startDate: params.outboundDateFrom,
    endDate: params.outboundDateTo,
    maxResults: EASYJET_PUBLISHED_SEARCH_MAX_RESULTS,
  };

  if (!allOrigins) {
    base.originIatas = origins.join(',');
    base.preferredOriginIatas = origins[0];
  }

  if (!allDestinations) {
    base.destinationIatas = destinations.join(',');
    base.preferredDestinationIatas = destinations[0];
  }

  return base;
}

/** Stable list order for the table; the CMS response already matches the query. */
export function sortPublishedDealsByPriceAndDate(deals: PublishedRouteDeal[]): PublishedRouteDeal[] {
  return [...deals].sort(
    (a, b) => a.priceFrom - b.priceFrom || a.departureDate.getTime() - b.departureDate.getTime()
  );
}
