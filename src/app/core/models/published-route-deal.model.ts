/**
 * Generic “published route” offer from an airline CMS / marketing feed.
 * Distinct from {@link FlightFare} (concrete return trip with legs).
 */

export interface PublishedRouteDeal {
  originIata: string;
  destinationIata: string;
  destinationName?: string;
  departureDate: Date;
  /** Lowest advertised price for this row (per booking or per person — provider-specific). */
  priceFrom: number;
  currencyCode: string;
}
