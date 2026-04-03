/**
 * Provider-agnostic shapes for “price by day” availability APIs (calendar / matrix),
 * distinct from {@link FlightFare} which describes concrete outbound+inbound offers.
 *
 * Dates are **local calendar `Date`** values (typically parsed from API `YYYY-MM-DD` in the
 * provider mapper via `parseIsoDateOnlyToLocalDate`).
 */

/** One calendar day with a lowest seen price (outbound or return leg). */
export interface FareCalendarDay {
  date: Date;
  price: number;
  lowFare: boolean;
}

/** Availability overview for a route and date window (aggregated from provider APIs). */
export interface FareAvailabilitySummary {
  startDate: Date;
  endDate: Date;
  outboundDays: FareCalendarDay[];
  inboundDays: FareCalendarDay[];
}
