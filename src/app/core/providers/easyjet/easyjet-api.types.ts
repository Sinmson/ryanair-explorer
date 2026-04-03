/** Raw JSON from `GET /homepage/api/availability` (EasyJet). */

export interface EasyJetAvailabilityDay {
  date: string;
  price: number;
  lowFare: boolean;
}

/** @see EasyJetAvailabilityDay */
export type EasyJetDepartureFlight = EasyJetAvailabilityDay;

/** @see EasyJetAvailabilityDay */
export type EasyJetReturnFlight = EasyJetAvailabilityDay;

export interface EasyJetAvailabilityResponse {
  startDate: string;
  endDate: string;
  departureFlights: EasyJetDepartureFlight[];
  returnFlights: EasyJetReturnFlight[];
}
