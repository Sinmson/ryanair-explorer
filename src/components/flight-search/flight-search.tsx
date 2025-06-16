import './flight-search.scss';

import { useState } from 'react';
import { Box, Button, Heading } from 'grommet';
import { FlightSearchConfig, ActiveAirportsResponse, Weekday } from '../../types/ryanair';
import AirportSelector from './aiport-selector/aiport-selector';
import DateRangeSelector from './date-range-selector/date-range-selector';
import DaysSelector from './days-selector/days-selector';

interface FlightSearchProps {
  airports: ActiveAirportsResponse[];
  onSearch: (config: FlightSearchConfig) => void;
}

export default function FlightSearch({ airports, onSearch }: FlightSearchProps) {
  const [departureAirports, setDepartureAirports] = useState<ActiveAirportsResponse[]>([]);
  const [arrivalAirports, setArrivalAirports] = useState<ActiveAirportsResponse[]>([]);
  const [durationFrom, setDurationFrom] = useState<number>(1);
  const [durationTo, setDurationTo] = useState<number>(7);
  const [travelDate, setTravelDate] = useState<{ start: Date; end: Date }>({
    start: new Date(),
    end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });
  const [departureWeekdays, setDepartureWeekdays] = useState<Weekday[]>([]);
  const [returnWeekdays, setReturnWeekdays] = useState<Weekday[]>([]);

  const handleSearch = () => {
    onSearch({
      departureAirports,
      arrivalAirports,
      durationFrom,
      durationTo,
      travelDate,
      departureWeekdays,
      returnWeekdays,
    });
  };

  const isSearchDisabled = departureAirports.length === 0 && arrivalAirports.length === 0;

  return (
    <Box className="flight-search-form" gap="medium" pad="medium">
      <Heading level={3}>Search Flights</Heading>
      <Box direction="row" gap="medium" align="start" justify="stretch">
        <Box width="medium">
          <AirportSelector
            airports={airports}
            onChange={setDepartureAirports}
          />
        </Box>
        <Box width="medium">
          <AirportSelector
            airports={airports}
            onChange={setArrivalAirports}
          />
        </Box>
        <Box width="450px">
          <DateRangeSelector
            value={travelDate}
            onChange={setTravelDate}
          />
        </Box>
        <Box width="full">
          <DaysSelector
            minDays={1}
            maxDays={20}
            onChange={(daysRange) => {
              setDurationFrom(daysRange.start);
              setDurationTo(daysRange.end);
            }}
          />
        </Box>
        <Button primary label="Search" onClick={handleSearch} style={{ minWidth: 120, height: 48 }} disabled={isSearchDisabled} />
      </Box>
    </Box>
  );
}
