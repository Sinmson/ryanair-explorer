export type Weekday = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";

export interface DateRange {
  start: Date;
  end: Date;
}

export interface RoundTripFaresRequestOptions {
  departureAirportIataCode: string,
  arrivalAirportIataCode?: string,
  outboundDepartureDateFrom: string,
  market?: LanguageCode,
  adultPaxCount?: number,
  outboundDepartureDateTo: string,
  inboundDepartureDateFrom: string,
  inboundDepartureDateTo: string,
  durationFrom: number,
  durationTo: number,
  outboundDepartureTimeFrom?: string,
  outboundDepartureTimeTo?: string,
  inboundDepartureTimeFrom?: string,
  inboundDepartureTimeTo?: string,
  arrivalAirportCategoryCodes?: ArrivalAirportCategoryCodes,
  outboundDepartureDaysOfWeek?: Weekday | string,
  inboundDepartureDaysOfWeek?: Weekday | string,
}


export interface FlightSearchConfig {
  departureAirports: ActiveAirportsResponse[];
  arrivalAirports: ActiveAirportsResponse[];
  departureWeekdays: Weekday[];
  returnWeekdays: Weekday[];
  durationFrom: number;
  durationTo: number;
  travelDate: DateRange;
}

export enum ArrivalAirportCategoryCodes {
  CITY = "CTY",
  BEACH = "SEA",
  NIGHTLIFE = "NIT",
  FAMILY = "FAM",
  OUTDOOR = "OUT",
  GOLD = "GOLF"
}

export enum LanguageCode {
  GERMAN = "de-DE",
  ENGLISH = "en-GB",
}

export interface RoundTripFaresResponse {
  arrivalAirportCategories: any | null;
  fares:                    Fare[];
  nextPage:                 number;
  size:                     number;
}

export interface Fare {
  outbound: Bound;
  inbound:  Bound;
  summary:  Summary;
}

export interface Bound {
  departureAirport: Airport;
  arrivalAirport:   Airport;
  departureDate:    Date;
  arrivalDate:      Date;
  price:            Price;
  flightKey:        string;
  flightNumber:     string;
  previousPrice:    number | null;
  priceUpdated:     number;
}

export interface Airport {
  countryName: string;
  iataCode:    string;
  name:        string;
  seoName:     string;
  city:        City;
}

export interface City {
  name:        string;
  code:        string;
  macCode?:    string;
  countryCode?: CountryCode;
}

export enum CountryCode {
  GERMANY = "de",
  SPAIN = "es",
  GREAT_BRITIAN = "gb",
  GREECE = "gr",
  IRELAND = "ie",
  ITALY = "it",
  LITHUANIA = "lt",
  MOROCCO = "ma",
  PORTUGAL = "pt",
}


export interface Price {
  value:               number;
  valueMainUnit:       string;
  valueFractionalUnit: string;
  currencyCode:        Currency;
  currencySymbol:      string;
}


export interface Summary {
  price:            Price;
  previousPrice:    number | null;
  newRoute:         boolean;
  tripDurationDays: number;
}



export interface ActiveAirportsResponse {
  code:        string;
  name:        string;
  seoName:     string;
  aliases:     string[];
  base:        boolean;
  city:        City;
  region:      Region;
  country:     Country;
  coordinates: Coordinates;
  timeZone:    string;
  macCity?:    City;
}


export interface Coordinates {
  latitude:  number;
  longitude: number;
}

export interface Country {
  code:               string;
  iso3code:           string;
  name:               string;
  currency:           Currency;
  defaultAirportCode: string;
  schengen:           boolean;
}

export enum Currency {
  SWISST_FRANC = "CHF",
  CZECH_KORUNA = "CZK",
  DANISH_KRONE = "DKK",
  EURO = "EUR",
  BRITISH_POUND = "GBP",
  HUNGARIAN_FORINT = "HUF",
  MOROCCAN_DIRHAMS = "MAD",
  NORWEGIAN_KRONE = "NOK",
  POLISH_SLOTYCH = "PLN",
  SWEDISH_KRONOR = "SEK",
}

export interface Region {
  name: string;
  code: string;
}
