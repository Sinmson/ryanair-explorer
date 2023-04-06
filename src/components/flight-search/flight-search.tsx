import './flight-search.scss';

import { useState } from 'react';
import { Box, Button, CheckBoxGroup, Collapsible, Heading, Layer, Text } from 'grommet';
import AirportSelector from './aiport-selector/aiport-selector.js';
import DateRangeSelector from './date-range-selector/date-range-selector.js';
import DaysSelector from './days-selector/days-selector.js';
import { getRoundTripFares } from '../../services/ryanair-client';
import { ActiveAirportsResponse, Airport, FlightSearchConfig, RoundTripFaresRequestOptions, RoundTripFaresResponse, Weekday } from '../../types';

const FlightSearch = ({ airports, onSearch }: {  airports: ActiveAirportsResponse[], onSearch: (config: FlightSearchConfig) => void }) => {
  const minDays = 1;
  const maxDays = 20;
  const [departureAirports, setDepartureAirports] =  useState<ActiveAirportsResponse[]>([]);
  const [arrivalAirports, setArrivalAirports] =  useState<ActiveAirportsResponse[]>([]);
  const [durationFrom, setDurationFrom] = useState(minDays);
  const [durationTo, setDurationTo] = useState(maxDays);
  const [departureWeekdays, setDepartureWeekdays] = useState<Weekday[]>([]);
  const [returnWeekdays, setReturnWeekdays] = useState<Weekday[]>([]);
  const [travelDate, setTravelDate] = useState({
    start: new Date("2023-04-01"),
    end: new Date("2023-04-30")
  });

  function searchFlights() {
    onSearch({
      departureAirports,
      arrivalAirports,
      durationFrom,
      durationTo,
      travelDate,
      departureWeekdays,
      returnWeekdays
    })
  }

  return (
    <Box pad="small" gap="medium">
      <Heading level={3} margin="0">Find your flight</Heading>

      <Box direction="row" gap="small" justify="between" wrap={true}>
        <Box width="small">
          <AirportSelector airports={airports} onChange={(selectedAirports => setDepartureAirports(selectedAirports))} />
        </Box>
        <Box width="small">
          <AirportSelector airports={airports} onChange={(selectedAirports => setArrivalAirports(selectedAirports))} />
        </Box>
        <Box width="small" height="44px">
          <DateRangeSelector value={travelDate} onChange={(dateRange) => setTravelDate(dateRange)}/>
        </Box>
        <Box flex style={{ minWidth: '300px' }}>
          <DaysSelector minDays={minDays} maxDays={maxDays} onChange={
            (daysRange) => { setDurationFrom(daysRange.start); setDurationTo(daysRange.end); }
            } />
        </Box>
        <Box>
          <Heading level={5}>Deparure<br/>Weekdays</Heading>
          <CheckBoxGroup  options={["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]} 
            onChange={(event: any) => {
              if(event) {
                const weekdays: Weekday[] = event.value.map( (weekday: string) => weekday.toUpperCase());
                setDepartureWeekdays(weekdays);
              }
          }} />
        </Box>
        <Box>
          <Heading level={5}>Arrival<br/>Weekdays</Heading>
          <CheckBoxGroup options={["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]} 
            onChange={(event: any) => {
              if(event) {
                const weekdays: Weekday[] = event.value.map( (weekday: string) => weekday.toUpperCase());
                console.log("weekdays", weekdays);
                setReturnWeekdays(weekdays);
              }
           }} />
        </Box>
        <Box>
          <Button onClick={searchFlights}>Search</Button>
        </Box>
      </Box>
    </Box>
  );
};

export default FlightSearch;
