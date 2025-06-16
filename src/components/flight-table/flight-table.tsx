import { ColumnConfig, DataTable } from 'grommet';
import { RoundTripFaresResponse, Fare } from '../../types/ryanair';
import CountryFlag from 'react-country-flag';

interface FlightTableProps {
  data: RoundTripFaresResponse[];
}

const userLocale = (typeof navigator !== 'undefined' && navigator.language) ? navigator.language : 'en-GB';
const localePath = userLocale.replace('-', '/').toLowerCase();

const flightTableColumns: ColumnConfig<Fare>[] = [
  {
    property: 'customDeparture',
    header: 'From',
    render: (data: Fare) => {
      const airport = data.outbound.departureAirport;
      const countryCode = airport.city && typeof airport.city.countryCode === 'string' ? airport.city.countryCode.toUpperCase() : '';
      return (
        <span>
          <CountryFlag countryCode={countryCode} svg style={{ width: '1em', height: '1em', marginRight: 4, verticalAlign: 'middle' }} />
          <b>{airport.countryName}</b>, {airport.city.name} <span style={{ color: '#888' }}>({airport.iataCode})</span>
        </span>
      );
    },
    sortable: true,
    search: true,
  },
  {
    property: 'customArrival',
    header: 'To',
    render: (data: Fare) => {
      const airport = data.outbound.arrivalAirport;
      const countryCode = airport.city && typeof airport.city.countryCode === 'string' ? airport.city.countryCode.toUpperCase() : '';
      return (
        <span>
          <CountryFlag countryCode={countryCode} svg style={{ width: '1em', height: '1em', marginRight: 4, verticalAlign: 'middle' }} />
          <b>{airport.countryName}</b>, {airport.city.name} <span style={{ color: '#888' }}>({airport.iataCode})</span>
        </span>
      );
    },
    sortable: true,
    search: true,
  },
  {
    property: 'outbound.departureDate',
    header: 'From Date',
    sortable: true,
    render: (data) =>
      data?.outbound?.departureDate &&
      new Date(data.outbound.departureDate).toLocaleString(userLocale, {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
  },
  {
    property: 'inbound.arrivalDate',
    header: 'To Date',
    sortable: true,
    render: (data) =>
      data?.inbound?.arrivalDate &&
      new Date(data.inbound.arrivalDate).toLocaleString(userLocale, {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
  },
  {
    property: 'summary.tripDurationDays',
    header: 'Days',
    sortable: true,
    aggregate: 'max',
  },
  {
    property: 'summary.price.value',
    header: 'Price',
    aggregate: 'min',
    align: 'end',
    render: (data: Fare) => {
      const depIata = data.outbound.departureAirport.iataCode;
      const arrIata = data.outbound.arrivalAirport.iataCode;
      const dateOut = new Date(data.outbound.departureDate).toISOString().slice(0, 10);
      const dateIn = new Date(data.inbound.departureDate).toISOString().slice(0, 10);
      const url = `https://www.ryanair.com/${localePath}/trip/flights/select?adults=1&children=0&infants=0&teens=0&tpAdults=1&tpChildren=0&tpInfants=0&tpTeens=0&dateOut=${dateOut}&tpStartDate=${dateOut}&dateIn=${dateIn}&tpEndDate=${dateIn}&isReturn=true&discount=0&tpDiscount=0&originIata=${depIata}&destinationIata=${arrIata}&tpOriginIata=${depIata}&tpDestinationIata=${arrIata}`;
      const price = data.summary.price.value;
      const currency = data.summary.price.currencyCode;
      let formattedPrice;
      try {
        formattedPrice = price.toLocaleString(userLocale, { style: 'currency', currency });
      } catch {
        formattedPrice = `${price} ${currency}`;
      }
      return (
        <a href={url} target="_blank" rel="noopener noreferrer" title="Open in Ryanair" style={{ color: '#1976d2', textDecoration: 'underline', fontWeight: 600, cursor: 'pointer' }}>
          {formattedPrice}
        </a>
      );
    },
  },
];

export default function FlightTable({ data }: FlightTableProps) {
  const allFares = data.flatMap(response => response.fares);

  return (
    <DataTable
      columns={flightTableColumns}
      data={allFares}
      primaryKey="outbound.flightKey"
      pad="0"
      sort={{ property: 'summary.price.value', direction: 'asc' }}
      step={10}
    />
  );
} 