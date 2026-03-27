import { describe, it, expect } from 'vitest';
import { mapRyanairAirportToAirport, mapRyanairFareToFlightFare } from './ryanair.mapper';
import { RyanairActiveAirport, RyanairFare } from './ryanair-api.types';

describe('Ryanair Mapper', () => {
  describe('mapRyanairAirportToAirport', () => {
    it('should map a Ryanair airport to a generic Airport', () => {
      const raw: RyanairActiveAirport = {
        code: 'DUB',
        name: 'Dublin',
        seoName: 'dublin',
        aliases: ['dublin-airport'],
        base: true,
        city: { name: 'Dublin', code: 'DUBLIN' },
        region: { name: 'Ireland', code: 'IE' },
        country: {
          code: 'ie',
          iso3code: 'IRL',
          name: 'Ireland',
          currency: 'EUR',
          defaultAirportCode: 'DUB',
          schengen: false,
        },
        coordinates: { latitude: 53.4264, longitude: -6.2499 },
        timeZone: 'Europe/Dublin',
      };

      const result = mapRyanairAirportToAirport(raw);

      expect(result.iataCode).toBe('DUB');
      expect(result.name).toBe('Dublin');
      expect(result.cityName).toBe('Dublin');
      expect(result.countryName).toBe('Ireland');
      expect(result.countryCode).toBe('ie');
      expect(result.isBase).toBe(true);
      expect(result.coordinates).toEqual({ latitude: 53.4264, longitude: -6.2499 });
    });
  });

  describe('mapRyanairFareToFlightFare', () => {
    it('should map a Ryanair fare to a generic FlightFare', () => {
      const fare: RyanairFare = {
        outbound: {
          departureAirport: {
            countryName: 'Germany',
            iataCode: 'CGN',
            name: 'Cologne',
            seoName: 'cologne',
            city: { name: 'Cologne', code: 'CGN', countryCode: 'de' },
          },
          arrivalAirport: {
            countryName: 'Ireland',
            iataCode: 'DUB',
            name: 'Dublin',
            seoName: 'dublin',
            city: { name: 'Dublin', code: 'DUB', countryCode: 'ie' },
          },
          departureDate: '2026-04-15T06:30:00',
          arrivalDate: '2026-04-15T07:45:00',
          price: { value: 29.99, valueMainUnit: '29', valueFractionalUnit: '99', currencyCode: 'EUR', currencySymbol: '€' },
          flightKey: 'FR123',
          flightNumber: 'FR 123',
          previousPrice: null,
          priceUpdated: 1711900000,
        },
        inbound: {
          departureAirport: {
            countryName: 'Ireland',
            iataCode: 'DUB',
            name: 'Dublin',
            seoName: 'dublin',
            city: { name: 'Dublin', code: 'DUB', countryCode: 'ie' },
          },
          arrivalAirport: {
            countryName: 'Germany',
            iataCode: 'CGN',
            name: 'Cologne',
            seoName: 'cologne',
            city: { name: 'Cologne', code: 'CGN', countryCode: 'de' },
          },
          departureDate: '2026-04-18T20:00:00',
          arrivalDate: '2026-04-18T22:15:00',
          price: { value: 35.99, valueMainUnit: '35', valueFractionalUnit: '99', currencyCode: 'EUR', currencySymbol: '€' },
          flightKey: 'FR456',
          flightNumber: 'FR 456',
          previousPrice: null,
          priceUpdated: 1711900000,
        },
        summary: {
          price: { value: 65.98, valueMainUnit: '65', valueFractionalUnit: '98', currencyCode: 'EUR', currencySymbol: '€' },
          previousPrice: null,
          newRoute: false,
          tripDurationDays: 3,
        },
      };

      const result = mapRyanairFareToFlightFare(fare);

      expect(result.providerId).toBe('ryanair');
      expect(result.totalPrice).toBe(65.98);
      expect(result.currency).toBe('EUR');
      expect(result.tripDurationDays).toBe(3);
      expect(result.outbound.departureAirport.iataCode).toBe('CGN');
      expect(result.outbound.arrivalAirport.iataCode).toBe('DUB');
      expect(result.inbound.departureAirport.iataCode).toBe('DUB');
      expect(result.bookingUrl).toContain('ryanair.com');
      expect(result.bookingUrl).toContain('originIata=CGN');
      expect(result.bookingUrl).toContain('destinationIata=DUB');
    });
  });
});
