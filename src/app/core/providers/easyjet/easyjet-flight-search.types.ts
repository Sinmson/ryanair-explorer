/**
 * Wire types for `GET /ejcms/cache15m/api/flights/search`.
 *
 * Observed payload (German “Veröffentlichung von Flügen”):
 * `{ "Flights": [ { "Price", "OriginIata", "DestinationIata", "DepartureDate" } ] }`
 * (`DepartureDate` as `YYYY-MM-DD`). Other key casings remain supported by the mapper.
 */

/** Top-level JSON object (non-array). */
export interface EasyJetFlightsSearchEnvelope {
  /** Lowercase variant if the API ever returns it */
  flights?: EasyJetFlightsSearchRowWire[];
  Flights?: EasyJetFlightsSearchRowWire[];
  results?: EasyJetFlightsSearchRowWire[];
  value?: EasyJetFlightsSearchRowWire[];
}

/**
 * One row in the CMS search response.
 * @see https://www.easyjet.com/de/veroffentlichung-von-flugen (XHR)
 */
export interface EasyJetFlightsSearchRowWire extends Record<string, unknown> {
  originIata?: string;
  originIATA?: string;
  /** Observed on live API */
  OriginIata?: string;
  destinationIata?: string;
  destinationIATA?: string;
  /** Observed on live API */
  DestinationIata?: string;
  departureDate?: string;
  outboundDepartureDate?: string;
  /** Observed on live API (`YYYY-MM-DD`) */
  DepartureDate?: string;
  price?: number;
  priceFrom?: number;
  totalPrice?: number;
  /** Observed on live API */
  Price?: number;
  currencyCode?: string;
  currency?: string;
  CurrencyCode?: string;
  destinationName?: string;
  destinationDisplayName?: string;
  DestinationName?: string;
}

export type EasyJetFlightsSearchResponseWire = EasyJetFlightsSearchEnvelope | EasyJetFlightsSearchRowWire[];
