import { describe, it, expect } from 'vitest';
import { mapEasyJetAvailabilityToSummary, mapEasyJetFlightsSearchToPublishedDeals } from './easyjet.mapper';
import { EasyJetAvailabilityResponse } from './easyjet-api.types';
import { parseEasyJetApiDate, parseIsoDateOnlyToLocalDate } from '../../utils/iso-date';

describe('EasyJet Mapper', () => {
  it('should map availability JSON to FareAvailabilitySummary with local Date values', () => {
    const raw: EasyJetAvailabilityResponse = {
      startDate: '2026-03-30',
      endDate: '2026-04-06',
      departureFlights: [
        { date: '2026-03-31', price: 210, lowFare: false },
        { date: '2026-04-01', price: 99, lowFare: true },
      ],
      returnFlights: [{ date: '2026-04-05', price: 62, lowFare: false }],
    };

    const result = mapEasyJetAvailabilityToSummary(raw);

    expect(result.startDate).toEqual(parseIsoDateOnlyToLocalDate('2026-03-30'));
    expect(result.endDate).toEqual(parseIsoDateOnlyToLocalDate('2026-04-06'));
    expect(result.outboundDays).toHaveLength(2);
    expect(result.inboundDays).toHaveLength(1);
    expect(result.outboundDays[0]).toEqual({
      date: parseIsoDateOnlyToLocalDate('2026-03-31'),
      price: 210,
      lowFare: false,
    });
    expect(result.outboundDays[1].lowFare).toBe(true);
    expect(result.inboundDays[0]).toEqual({
      date: parseIsoDateOnlyToLocalDate('2026-04-05'),
      price: 62,
      lowFare: false,
    });
  });

  it('maps CMS flight search envelope with flights[] to PublishedRouteDeal[]', () => {
    const raw = {
      flights: [
        {
          originIata: 'dus',
          destinationIata: 'mxp',
          departureDate: '2026-10-20',
          priceFrom: 49.99,
          currencyCode: 'EUR',
          destinationName: 'Mailand Malpensa',
        },
      ],
    };

    const deals = mapEasyJetFlightsSearchToPublishedDeals(raw);

    expect(deals).toHaveLength(1);
    expect(deals[0]).toEqual({
      originIata: 'DUS',
      destinationIata: 'MXP',
      destinationName: 'Mailand Malpensa',
      departureDate: parseEasyJetApiDate('2026-10-20'),
      priceFrom: 49.99,
      currencyCode: 'EUR',
    });
  });

  it('accepts array root and Flights / nested origin.iata', () => {
    const raw = {
      Flights: [
        {
          origin: { iata: 'BER' },
          DestinationIata: 'LIS',
          outboundDepartureDate: '2026-11-01T00:00:00.000Z',
          price: 39,
        },
      ],
    };

    const deals = mapEasyJetFlightsSearchToPublishedDeals(raw);

    expect(deals).toHaveLength(1);
    expect(deals[0].originIata).toBe('BER');
    expect(deals[0].destinationIata).toBe('LIS');
    expect(deals[0].priceFrom).toBe(39);
    expect(deals[0].currencyCode).toBe('EUR');
  });

  it('drops rows missing required fields', () => {
    const raw = {
      flights: [{ originIata: 'DUS' }, { originIata: 'FRA', destinationIata: 'BCN', departureDate: '2026-12-01', priceFrom: 19 }],
    };

    const deals = mapEasyJetFlightsSearchToPublishedDeals(raw);

    expect(deals).toHaveLength(1);
    expect(deals[0].destinationIata).toBe('BCN');
  });

  it('maps live CMS shape (Flights + PascalCase fields)', () => {
    const raw = {
      Flights: [
        { Price: 44.52, OriginIata: 'DUS', DestinationIata: 'MXP', DepartureDate: '2026-11-08' },
        { Price: 59.02, OriginIata: 'DUS', DestinationIata: 'LGW', DepartureDate: '2026-11-05' },
      ],
    };

    const deals = mapEasyJetFlightsSearchToPublishedDeals(raw);

    expect(deals).toHaveLength(2);
    expect(deals[0]).toMatchObject({
      originIata: 'DUS',
      destinationIata: 'MXP',
      priceFrom: 44.52,
      currencyCode: 'EUR',
    });
    expect(deals[0].departureDate).toEqual(parseEasyJetApiDate('2026-11-08'));
  });
});
