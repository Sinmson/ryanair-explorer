export type Weekday = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export enum RyanairLanguageCode {
  GERMAN = 'de-DE',
  ENGLISH = 'en-GB',
}

export enum RyanairCurrency {
  SWISS_FRANC = 'CHF',
  CZECH_KORUNA = 'CZK',
  DANISH_KRONE = 'DKK',
  EURO = 'EUR',
  BRITISH_POUND = 'GBP',
  HUNGARIAN_FORINT = 'HUF',
  MOROCCAN_DIRHAMS = 'MAD',
  NORWEGIAN_KRONE = 'NOK',
  POLISH_ZLOTY = 'PLN',
  SWEDISH_KRONOR = 'SEK',
}

export interface RyanairRoundTripFaresRequest {
  departureAirportIataCode: string;
  arrivalAirportIataCode?: string;
  outboundDepartureDateFrom: string;
  outboundDepartureDateTo: string;
  inboundDepartureDateFrom: string;
  inboundDepartureDateTo: string;
  durationFrom: number;
  durationTo: number;
  market?: RyanairLanguageCode;
  adultPaxCount?: number;
  outboundDepartureTimeFrom?: string;
  outboundDepartureTimeTo?: string;
  inboundDepartureTimeFrom?: string;
  inboundDepartureTimeTo?: string;
  outboundDepartureDaysOfWeek?: string;
  inboundDepartureDaysOfWeek?: string;
}

export interface RyanairRoundTripFaresResponse {
  arrivalAirportCategories: unknown;
  fares: RyanairFare[];
  nextPage: number;
  size: number;
}

export interface RyanairFare {
  outbound: RyanairBound;
  inbound: RyanairBound;
  summary: RyanairSummary;
}

export interface RyanairBound {
  departureAirport: RyanairAirport;
  arrivalAirport: RyanairAirport;
  departureDate: string;
  arrivalDate: string;
  price: RyanairPrice;
  flightKey: string;
  flightNumber: string;
  previousPrice: number | null;
  priceUpdated: number;
}

export interface RyanairAirport {
  countryName: string;
  iataCode: string;
  name: string;
  seoName: string;
  city: RyanairCity;
}

export interface RyanairCity {
  name: string;
  code: string;
  macCode?: string;
  countryCode?: string;
}

export interface RyanairPrice {
  value: number;
  valueMainUnit: string;
  valueFractionalUnit: string;
  currencyCode: string;
  currencySymbol: string;
}

export interface RyanairSummary {
  price: RyanairPrice;
  previousPrice: number | null;
  newRoute: boolean;
  tripDurationDays: number;
}

export interface RyanairActiveAirport {
  code: string;
  name: string;
  seoName: string;
  aliases: string[];
  base: boolean;
  city: RyanairCity;
  region: { name: string; code: string };
  country: {
    code: string;
    iso3code: string;
    name: string;
    currency: string;
    defaultAirportCode: string;
    schengen: boolean;
  };
  coordinates: { latitude: number; longitude: number };
  timeZone: string;
  macCity?: RyanairCity;
}
