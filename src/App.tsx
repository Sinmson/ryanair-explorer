import { useContext, useEffect, useState } from 'react';
import FlightSearch from './components/flight-search/flight-search.js';

import {
  Box,
  Button,
  ColumnConfig,
  DataTable,
  grommet,
  Grommet,
  Heading,
  Page,
  PageContent,
  Table,
  Text,
  WorldMap,
} from 'grommet';
import { AppBar } from './components/app-bar/app-bar';
import { Moon, Sun } from 'grommet-icons';
import { deepMerge } from 'grommet/utils';
import { AppFooter } from './components/app-footer/app-footer';
import { Fare, FlightSearchConfig, RoundTripFaresResponse } from "./types/index.js";
import { getActiveAirports, getRoundTripFares } from "./services/ryanair-client.js";
import { Price, Airport, ActiveAirportsResponse } from './types/ryanair/index';


interface FlightTableData {
  departureAirportName: string;
  arrivalAirportName: string;
  arrivalAirportCountryName: string;
  departureDate: Date;
  returnDate: Date;
  nrOfDays: number;
  price: number;
  priceCurrencySymbol: string;
  key: string;
}

function App() {
  const [dark, setDark] = useState(false);

  const [roundTripFares, setRoundTripFares] = useState<FlightTableData[]>();
  const [availableAirports, setAvailableAirports] = useState<ActiveAirportsResponse[]>([]);
  
  const [airports, setAirports] = useState<ActiveAirportsResponse[]>([]);
  // once on startuo
  useEffect( () => {
    if(airports.length <= 0) {
      getActiveAirports().then( activeAirports => setAirports(activeAirports));
    }
  }, []);


  const theme = deepMerge(grommet, {
    dateInput: {
      icon: {
        size: '16px',
      },
      container: {
        // round: 'xlarge',
      },
    },
    global: {
      colors: {
        // brand: 'light-3',
        focus: 'transparent',
      },
      font: {
        family: 'Roboto',
        size: '18px',
        height: '20px',
      },
    },
  });

  const flightTableColumns: ColumnConfig<FlightTableData>[] = [{
    property: 'departureAirportName',
    header: 'Departure'
  },
  {
    property: 'arrivalAirportName',
    header: 'Arrival',
    search: true,
    sortable: true
  },
  {
    property: 'arrivalAirportCountryName',
    header: 'Arrival (Country)',
    search: true,
    sortable: true
  },
  {
    property: 'departureDate',
    header: 'From',
    sortable: true,
    render: (data) => { return data?.departureDate && new Date(data.departureDate).toLocaleDateString('de-DE', { weekday: "short", day: "2-digit", month: "short", year: "2-digit", hour: "2-digit" }) },
  },
  {
    property: 'returnDate',
    header: 'To',
    sortable: true,
    render: (data) => { return data?.returnDate && new Date(data.returnDate).toLocaleDateString('de-DE', { weekday: "short", day: "2-digit", month: "short", year: "2-digit", hour: "2-digit" }) },
  },
  {
    property: 'nrOfDays',
    header: 'Days',
    sortable: true,
    aggregate: "max"
  },
  {
    property: 'price',
    header: 'Price',
    aggregate: "min",
    align: "end"
  }
  ]

  function getColorForCity(cityName: string): string {
    // First, hash the city name to generate a unique but consistent number
    let hash = 0;
    for (let i = 0; i < cityName.length; i++) {
      hash = cityName.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Then, convert the hash to a hex string
    const hex = (hash & 0x00FFFFFF).toString(16);

    // Finally, prefix the hex string with zeros to ensure it's always 6 digits long
    return `#${'00000'.substring(0, 6 - hex.length)}${hex}`;
  }


  function getActiveAirportFromIataCode(iataCode: string) {
    for(const airport of airports) {
      if(airport.code === iataCode) {
        return airport;
      }
    }
    return null;
  }

  async function searchFlight(config: FlightSearchConfig) {
    console.log("searchFlight", config)
    const promises: Promise<RoundTripFaresResponse>[] = [];

    for (const airport of config.departureAirports) {
      const earliestStareDate = config.travelDate.start;
      const latestStareDate = config.travelDate.end;

      const earliestEndDate = new Date(earliestStareDate);
      earliestEndDate.setDate(earliestStareDate.getDate() + config.durationFrom);

      const latestEndDate = new Date(latestStareDate);
      latestEndDate.setDate(latestStareDate.getDate() + config.durationFrom);

      const optiuons = {
        departureAirportIataCode: airport.code,
        durationFrom: config.durationFrom,
        durationTo: config.durationTo,
        outboundDepartureDateFrom: earliestStareDate.toLocaleDateString("en-CA"),
        outboundDepartureDateTo: latestStareDate.toLocaleDateString("en-CA"),
        inboundDepartureDateFrom: earliestEndDate.toLocaleDateString("en-CA"),
        inboundDepartureDateTo: latestEndDate.toLocaleDateString("en-CA"),
        outboundDepartureDaysOfWeek: config.departureWeekdays.join(","),
        inboundDepartureDaysOfWeek: config.returnWeekdays.join(","),

      };
      const promise = getRoundTripFares(optiuons);
      promises.push(promise);
    }

    const results = await Promise.allSettled(promises);

    setRoundTripFares([]);
    let newRoundTripFares: FlightTableData[] = [];
    const arrivalAirports: Set<ActiveAirportsResponse> = new Set();

    for (const result of results) {
      if (result.status === 'fulfilled') {
        const res = result.value;
        for (const fare of res.fares) {

          const activeAirport = getActiveAirportFromIataCode(fare.outbound.arrivalAirport.iataCode); 
          if(activeAirport) {
            arrivalAirports.add(activeAirport);
          } 

          newRoundTripFares.push({
            arrivalAirportCountryName: fare.outbound.arrivalAirport.countryName,
            arrivalAirportName: fare.outbound.arrivalAirport.name,
            departureAirportName: fare.outbound.departureAirport.name,
            departureDate: fare.outbound.departureDate,
            returnDate: fare.inbound.arrivalDate,
            nrOfDays: fare.summary.tripDurationDays,
            price: fare.summary.price.value,
            priceCurrencySymbol: fare.summary.price.currencySymbol,
            key: `${fare.outbound.flightKey}-${fare.inbound.flightKey}`
          });
        }
      }
    }
    console.log("newRoundTripFares", newRoundTripFares);
    console.log("arrivalAirports", arrivalAirports);
    setRoundTripFares(newRoundTripFares);
    setAvailableAirports(Array.from(arrivalAirports.values()));
  }

  return (
    <Grommet full theme={theme} themeMode={dark ? 'dark' : 'light'}>
      <Page flex fill background="light-0">
        <AppBar>
          <Text size="large">My App</Text>
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
          <FlightSearch airports={airports} onSearch={searchFlight} />
          <Box flex pad="small">
            <Heading level={3} >Flights</Heading>

            {
              roundTripFares != null &&
              <DataTable columns={flightTableColumns} data={roundTripFares}
                primaryKey="key"
                pad="0"
                sort={{ property: "price", direction: "asc" }}
                step={10}
              />
            }
          </Box>
          <Box>
            <WorldMap
              places={availableAirports.map(airport => ({
                location: [airport.coordinates.latitude, airport.coordinates.longitude],
                name: airport.name,
                color: getColorForCity(airport.name)
              }))}
            />
          </Box>
        </PageContent>
        <AppFooter />
      </Page>
    </Grommet>
  );
}

export default App;
