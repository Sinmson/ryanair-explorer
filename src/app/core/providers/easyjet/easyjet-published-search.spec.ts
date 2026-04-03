import { describe, it, expect } from 'vitest';
import {
  easyJetPublishedSearchQueryFromFlightParams,
  sortPublishedDealsByPriceAndDate,
} from './easyjet-published-search';
import { PublishedRouteDeal } from '../../models/published-route-deal.model';
import { parseEasyJetApiDate } from '../../utils/iso-date';

const baseParams = {
  departureAirportCodes: ['DUS', 'ber'],
  arrivalAirportCodes: [] as string[],
  outboundDateFrom: '2026-10-19',
  outboundDateTo: '2026-11-30',
  inboundDateFrom: '2026-10-25',
  inboundDateTo: '2026-12-05',
  durationFrom: 3,
  durationTo: 7,
};

describe('easyJetPublishedSearchQueryFromFlightParams', () => {
  it('returns null when neither origin nor destination is set', () => {
    expect(
      easyJetPublishedSearchQueryFromFlightParams({
        ...baseParams,
        departureAirportCodes: [],
        arrivalAirportCodes: [],
      })
    ).toBeNull();
  });

  it('with only departures: AllOrigins false, AllDestinations true, OriginIatas set', () => {
    const q = easyJetPublishedSearchQueryFromFlightParams(baseParams);
    expect(q).not.toBeNull();
    expect(q!.allOrigins).toBe(false);
    expect(q!.allDestinations).toBe(true);
    expect(q!.originIatas).toBe('DUS,BER');
    expect(q!.preferredOriginIatas).toBe('DUS');
    expect(q!.destinationIatas).toBeUndefined();
    expect(q!.startDate).toBe('2026-10-19');
    expect(q!.endDate).toBe('2026-11-30');
  });

  it('with only arrivals: AllOrigins true, AllDestinations false, DestinationIatas set', () => {
    const q = easyJetPublishedSearchQueryFromFlightParams({
      ...baseParams,
      departureAirportCodes: [],
      arrivalAirportCodes: ['mxp', 'lgw'],
    });
    expect(q).not.toBeNull();
    expect(q!.allOrigins).toBe(true);
    expect(q!.allDestinations).toBe(false);
    expect(q!.originIatas).toBeUndefined();
    expect(q!.destinationIatas).toBe('MXP,LGW');
    expect(q!.preferredDestinationIatas).toBe('MXP');
  });

  it('with both: both flags false and both IATA lists set', () => {
    const q = easyJetPublishedSearchQueryFromFlightParams({
      ...baseParams,
      arrivalAirportCodes: ['MXP'],
    });
    expect(q).not.toBeNull();
    expect(q!.allOrigins).toBe(false);
    expect(q!.allDestinations).toBe(false);
    expect(q!.originIatas).toBe('DUS,BER');
    expect(q!.destinationIatas).toBe('MXP');
  });
});

describe('sortPublishedDealsByPriceAndDate', () => {
  it('sorts by price then departure date without mutating the input', () => {
    const a: PublishedRouteDeal = {
      originIata: 'DUS',
      destinationIata: 'MXP',
      departureDate: parseEasyJetApiDate('2026-11-10'),
      priceFrom: 90,
      currencyCode: 'EUR',
    };
    const b: PublishedRouteDeal = {
      originIata: 'DUS',
      destinationIata: 'LGW',
      departureDate: parseEasyJetApiDate('2026-11-05'),
      priceFrom: 44,
      currencyCode: 'EUR',
    };
    const c: PublishedRouteDeal = {
      originIata: 'DUS',
      destinationIata: 'BCN',
      departureDate: parseEasyJetApiDate('2026-11-01'),
      priceFrom: 44,
      currencyCode: 'EUR',
    };
    const input = [a, b, c];
    const sorted = sortPublishedDealsByPriceAndDate(input);
    expect(input[0]).toBe(a);
    expect(sorted.map(d => d.destinationIata)).toEqual(['BCN', 'LGW', 'MXP']);
  });
});
