import { FareAvailabilitySummary, FareCalendarDay } from '../../models/fare-availability.model';
import { PublishedRouteDeal } from '../../models/published-route-deal.model';
import { parseEasyJetApiDate, parseIsoDateOnlyToLocalDate } from '../../utils/iso-date';
import {
  EasyJetAvailabilityDay,
  EasyJetAvailabilityResponse,
} from './easyjet-api.types';
import {
  EasyJetFlightsSearchEnvelope,
  EasyJetFlightsSearchResponseWire,
  EasyJetFlightsSearchRowWire,
} from './easyjet-flight-search.types';

export function mapEasyJetAvailabilityToSummary(
  raw: EasyJetAvailabilityResponse
): FareAvailabilitySummary {
  return {
    startDate: parseIsoDateOnlyToLocalDate(raw.startDate),
    endDate: parseIsoDateOnlyToLocalDate(raw.endDate),
    outboundDays: raw.departureFlights.map(mapEasyJetDayToFareCalendarDay),
    inboundDays: raw.returnFlights.map(mapEasyJetDayToFareCalendarDay),
  };
}

function mapEasyJetDayToFareCalendarDay(day: EasyJetAvailabilityDay): FareCalendarDay {
  return {
    date: parseIsoDateOnlyToLocalDate(day.date),
    price: day.price,
    lowFare: day.lowFare,
  };
}

export function mapEasyJetFlightsSearchToPublishedDeals(
  raw: EasyJetFlightsSearchResponseWire
): PublishedRouteDeal[] {
  return extractFlightSearchRows(raw)
    .map(mapFlightSearchRowToPublishedDeal)
    .filter((d): d is PublishedRouteDeal => d !== null);
}

function extractFlightSearchRows(raw: EasyJetFlightsSearchResponseWire): EasyJetFlightsSearchRowWire[] {
  if (Array.isArray(raw)) {
    return raw;
  }
  const e = raw as EasyJetFlightsSearchEnvelope;
  return e.flights ?? e.Flights ?? e.results ?? e.value ?? [];
}

function mapFlightSearchRowToPublishedDeal(row: EasyJetFlightsSearchRowWire): PublishedRouteDeal | null {
  const originIata = firstString(
    row.originIata,
    row.originIATA,
    row.OriginIata,
    nestedIata(row, 'origin'),
    nestedIata(row, 'Origin')
  );
  const destinationIata = firstString(
    row.destinationIata,
    row.destinationIATA,
    row.DestinationIata,
    nestedIata(row, 'destination'),
    nestedIata(row, 'Destination')
  );
  const dateStr = firstString(row.departureDate, row.outboundDepartureDate, row.DepartureDate);
  const price = firstNumber(row.priceFrom, row.price, row.totalPrice, row.Price);
  const currencyCode = firstString(row.currencyCode, row.currency, row.CurrencyCode) ?? 'EUR';
  const destinationName = firstString(
    row.destinationName,
    row.destinationDisplayName,
    row.DestinationName
  );

  if (!originIata || !destinationIata || !dateStr || price === undefined) {
    return null;
  }

  return {
    originIata: originIata.toUpperCase(),
    destinationIata: destinationIata.toUpperCase(),
    destinationName,
    departureDate: parseEasyJetApiDate(dateStr),
    priceFrom: price,
    currencyCode,
  };
}

function nestedIata(row: EasyJetFlightsSearchRowWire, key: string): string | undefined {
  const v = row[key];
  if (v && typeof v === 'object' && 'iata' in v && typeof (v as { iata: unknown }).iata === 'string') {
    return (v as { iata: string }).iata;
  }
  if (v && typeof v === 'object' && 'Iata' in v && typeof (v as { Iata: unknown }).Iata === 'string') {
    return (v as { Iata: string }).Iata;
  }
  return undefined;
}

function firstString(...vals: unknown[]): string | undefined {
  for (const v of vals) {
    if (typeof v === 'string' && v.trim().length > 0) {
      return v.trim();
    }
  }
  return undefined;
}

function firstNumber(...vals: unknown[]): number | undefined {
  for (const v of vals) {
    if (typeof v === 'number' && !Number.isNaN(v)) {
      return v;
    }
  }
  return undefined;
}
