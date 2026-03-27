import { Airport } from '../../models/airport.model';
import { FlightFare, FlightAirport } from '../../models/flight-fare.model';
import { RyanairActiveAirport, RyanairFare, RyanairAirport } from './ryanair-api.types';

const RYANAIR_PROVIDER_ID = 'ryanair';

export function mapRyanairAirportToAirport(raw: RyanairActiveAirport): Airport {
  return {
    iataCode: raw.code,
    name: raw.name,
    cityName: raw.city.name,
    countryName: raw.country.name,
    countryCode: raw.country.code,
    coordinates: raw.coordinates,
    aliases: raw.aliases,
    isBase: raw.base,
  };
}

export function mapRyanairFareToFlightFare(fare: RyanairFare): FlightFare {
  const userLocale = typeof navigator !== 'undefined' ? navigator.language : 'en-GB';
  const localePath = userLocale.replace('-', '/').toLowerCase();
  const depIata = fare.outbound.departureAirport.iataCode;
  const arrIata = fare.outbound.arrivalAirport.iataCode;
  const dateOut = fare.outbound.departureDate.slice(0, 10);
  const dateIn = fare.inbound.departureDate.slice(0, 10);

  return {
    providerId: RYANAIR_PROVIDER_ID,
    outbound: {
      departureAirport: mapRyanairFlightAirport(fare.outbound.departureAirport),
      arrivalAirport: mapRyanairFlightAirport(fare.outbound.arrivalAirport),
      departureDate: fare.outbound.departureDate,
      arrivalDate: fare.outbound.arrivalDate,
      flightNumber: fare.outbound.flightNumber,
      price: fare.outbound.price.value,
    },
    inbound: {
      departureAirport: mapRyanairFlightAirport(fare.inbound.departureAirport),
      arrivalAirport: mapRyanairFlightAirport(fare.inbound.arrivalAirport),
      departureDate: fare.inbound.departureDate,
      arrivalDate: fare.inbound.arrivalDate,
      flightNumber: fare.inbound.flightNumber,
      price: fare.inbound.price.value,
    },
    totalPrice: fare.summary.price.value,
    currency: fare.summary.price.currencyCode,
    currencySymbol: fare.summary.price.currencySymbol,
    tripDurationDays: fare.summary.tripDurationDays,
    bookingUrl: `https://www.ryanair.com/${localePath}/trip/flights/select?adults=1&children=0&infants=0&teens=0&dateOut=${dateOut}&dateIn=${dateIn}&isReturn=true&discount=0&originIata=${depIata}&destinationIata=${arrIata}`,
    isNewRoute: fare.summary.newRoute,
  };
}

function mapRyanairFlightAirport(raw: RyanairAirport): FlightAirport {
  return {
    iataCode: raw.iataCode,
    name: raw.name,
    cityName: raw.city.name,
    countryName: raw.countryName,
    countryCode: raw.city.countryCode?.toUpperCase() ?? '',
  };
}
