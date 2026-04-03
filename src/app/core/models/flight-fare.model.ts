/** Concrete round-trip offer (per leg with airports). For day-by-day price calendars see {@link FareAvailabilitySummary}. */
export interface FlightFare {
  providerId: string;
  outbound: FlightLeg;
  inbound: FlightLeg;
  totalPrice: number;
  currency: string;
  currencySymbol?: string;
  tripDurationDays: number;
  bookingUrl: string;
  isNewRoute?: boolean;
}

export interface FlightLeg {
  departureAirport: FlightAirport;
  arrivalAirport: FlightAirport;
  departureDate: string;
  arrivalDate: string;
  flightNumber?: string;
  price?: number;
}

export interface FlightAirport {
  iataCode: string;
  name: string;
  cityName: string;
  countryName: string;
  countryCode: string;
}
