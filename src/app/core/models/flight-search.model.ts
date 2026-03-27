export interface FlightSearchParams {
  departureAirportCodes: string[];
  arrivalAirportCodes: string[];
  outboundDateFrom: string;
  outboundDateTo: string;
  inboundDateFrom: string;
  inboundDateTo: string;
  durationFrom: number;
  durationTo: number;
  adults?: number;
  outboundDepartureDaysOfWeek?: string;
  inboundDepartureDaysOfWeek?: string;
}
