import { Suspense, lazy, useState, useEffect } from 'react';
import {
  Box,
  Button,
  Grommet,
  Heading,
  Page,
  PageContent,
  Text,
  grommet,
} from 'grommet';
import { Moon, Sun } from 'grommet-icons';
import { deepMerge } from 'grommet/utils';
import { ErrorBoundary } from './components/error-boundary/error-boundary';
import { AppBar } from './components/app-bar/app-bar';
import { AppFooter } from './components/app-footer/app-footer';
import { FlightSearchConfig } from './types';
import { getActiveAirports, getRoundTripFares } from './services/ryanair-client';
import { ActiveAirportsResponse, LanguageCode } from './types/ryanair';
import { RoundTripFaresResponse } from './types';

// Lazy load components
const FlightSearch = lazy(() => import('./components/flight-search/flight-search'));
const FlightTable = lazy(() => import('./components/flight-table/flight-table'));

const theme = deepMerge(grommet, {
  dateInput: {
    icon: {
      size: '16px',
    },
  },
  global: {
    colors: {
      focus: 'transparent',
    },
    font: {
      family: 'Roboto',
      size: '18px',
      height: '20px',
    },
  },
});

function App() {
  const [dark, setDark] = useState(false);
  const [airports, setAirports] = useState<ActiveAirportsResponse[]>([]);
  const [roundTripFares, setRoundTripFares] = useState<RoundTripFaresResponse[]>([]);
  const [availableAirports, setAvailableAirports] = useState<ActiveAirportsResponse[]>([]);

  // Load airports on mount
  useEffect(() => {
    console.log("airports", airports);
    if (airports.length <= 0) {
      getActiveAirports().then(activeAirports => setAirports(activeAirports));
    }
  }, [airports.length]);


  const getMarketFromLocale = (locale: string): LanguageCode => {
    if (locale.startsWith('de')) return LanguageCode.GERMAN;
    if (locale.startsWith('en')) return LanguageCode.ENGLISH;
    // Add more mappings as needed
    return LanguageCode.ENGLISH;
  };

  const handleSearch = async (config: FlightSearchConfig) => {
    const promises: Promise<RoundTripFaresResponse>[] = [];
    const userLocale = navigator.language || 'en-GB';
    const market = getMarketFromLocale(userLocale);

    // If only arrival airport(s) are selected, loop over all airports as departures
    if (config.departureAirports.length === 0 && config.arrivalAirports.length > 0) {
      for (const arrivalAirport of config.arrivalAirports) {
        for (const departureAirport of airports) {
          if (arrivalAirport.code === departureAirport.code) continue;
          const earliestStartDate = config.travelDate.start;
          const latestStartDate = config.travelDate.end;

          const earliestEndDate = new Date(earliestStartDate);
          earliestEndDate.setDate(earliestStartDate.getDate() + config.durationFrom);

          const latestEndDate = new Date(latestStartDate);
          latestEndDate.setDate(latestStartDate.getDate() + config.durationFrom);

          const options = {
            departureAirportIataCode: departureAirport.code,
            arrivalAirportIataCode: arrivalAirport.code,
            durationFrom: config.durationFrom,
            durationTo: config.durationTo,
            outboundDepartureDateFrom: earliestStartDate.toLocaleDateString('en-CA'),
            outboundDepartureDateTo: latestStartDate.toLocaleDateString('en-CA'),
            inboundDepartureDateFrom: earliestEndDate.toLocaleDateString('en-CA'),
            inboundDepartureDateTo: latestEndDate.toLocaleDateString('en-CA'),
            outboundDepartureDaysOfWeek: config.departureWeekdays.join(','),
            inboundDepartureDaysOfWeek: config.returnWeekdays.join(','),
            market,
          };
          const promise = getRoundTripFares(options);
          promises.push(promise);
        }
      }
    } else {
      // Use all selected departures, and all arrivals or undefined if none selected
      const usedDepartureAirports = config.departureAirports.length > 0 ? config.departureAirports : airports;
      const usedArrivalAirports = config.arrivalAirports.length > 0 ? config.arrivalAirports : [undefined];

      for (const departureAirport of usedDepartureAirports) {
        for (const arrivalAirport of usedArrivalAirports) {
          if (arrivalAirport && arrivalAirport.code === departureAirport.code) continue;
          const earliestStartDate = config.travelDate.start;
          const latestStartDate = config.travelDate.end;

          const earliestEndDate = new Date(earliestStartDate);
          earliestEndDate.setDate(earliestStartDate.getDate() + config.durationFrom);

          const latestEndDate = new Date(latestStartDate);
          latestEndDate.setDate(latestStartDate.getDate() + config.durationFrom);

          const options = {
            departureAirportIataCode: departureAirport.code,
            ...(arrivalAirport ? { arrivalAirportIataCode: arrivalAirport.code } : {}),
            durationFrom: config.durationFrom,
            durationTo: config.durationTo,
            outboundDepartureDateFrom: earliestStartDate.toLocaleDateString('en-CA'),
            outboundDepartureDateTo: latestStartDate.toLocaleDateString('en-CA'),
            inboundDepartureDateFrom: earliestEndDate.toLocaleDateString('en-CA'),
            inboundDepartureDateTo: latestEndDate.toLocaleDateString('en-CA'),
            outboundDepartureDaysOfWeek: config.departureWeekdays.join(','),
            inboundDepartureDaysOfWeek: config.returnWeekdays.join(','),
            market,
          };
          const promise = getRoundTripFares(options);
          promises.push(promise);
        }
      }
    }

    const results = await Promise.allSettled(promises);
    const newRoundTripFares: RoundTripFaresResponse[] = [];
    const foundArrivalAirports: Set<ActiveAirportsResponse> = new Set();

    for (const result of results) {
      if (result.status === 'fulfilled') {
        const res = result.value;
        newRoundTripFares.push(res);
        for (const fare of res.fares) {
          const activeAirport = airports.find(a => a.code === fare.outbound.arrivalAirport.iataCode);
          if (activeAirport) {
            foundArrivalAirports.add(activeAirport);
          }
        }
      }
    }

    setRoundTripFares(newRoundTripFares);
    setAvailableAirports(Array.from(foundArrivalAirports));
  };

  return (
    <ErrorBoundary>
      <Grommet full theme={theme} themeMode={dark ? 'dark' : 'light'}>
        <Page flex fill background="light-0">
          <AppBar>
            <Text size="large">Ryanair Explorer</Text>
            <Button
              a11yTitle={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              icon={dark ? <Moon /> : <Sun />}
              onClick={() => setDark(!dark)}
              tip={{
                content: (
                  <Box
                    pad="small"
                    round="small"
                    background={dark ? 'dark-1' : 'light-3'}
                  >
                    {dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  </Box>
                ),
                plain: true,
              }}
            />
          </AppBar>
          <PageContent flex={{ grow: 1, shrink: 0 }}>
            <Suspense fallback={<Box>Loading...</Box>}>
              <FlightSearch airports={airports} onSearch={handleSearch} />
            </Suspense>
            <Box flex pad="small">
              <Heading level={3}>Flights</Heading>
              <Suspense fallback={<Box>Loading flights...</Box>}>
                {roundTripFares && <FlightTable data={roundTripFares} />}
              </Suspense>
            </Box>
          </PageContent>
          <AppFooter />
        </Page>
      </Grommet>
    </ErrorBoundary>
  );
}

export default App;
