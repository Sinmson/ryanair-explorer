import { useEffect, useState } from 'react';
import { Box, Button, Tag, Text, TextInput, Tip } from 'grommet';
import { Add, Close, Globe, Search } from 'grommet-icons';
import { ActiveAirportsResponse, Airport, Currency } from '../../../types';
import { getActiveAirports } from "../../../services/ryanair-client";


interface Suggestion {
  label: React.ReactNode;
  value: ActiveAirportsResponse;
}

const AirportSelector = ({ airports, onChange}: { airports: ActiveAirportsResponse[], onChange: (selectedAirports: ActiveAirportsResponse[]) => void }) => {
  const [selected, setSelected] = useState<ActiveAirportsResponse[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>(
    prepareSuggestions()
  );


  useEffect(() => {
    setSuggestions(prepareSuggestions());
  }, [inputValue]);


  function prepareSuggestions() {
    if (!inputValue) {
      return [];
    }
    const sugs = airports
      .filter(
        (a) =>
          a.name.toUpperCase().includes(inputValue.toUpperCase()) ||
          a.code.toUpperCase().includes(inputValue.toUpperCase())
      )
      .filter((a) => !selected.some((s) => s.code == a.code))
      .sort((a1, a2) => (a1.name < a2.name ? -1 : 1))
      .map((a) => ({
        label: <Text>{a.name}</Text>,
        value: a,
      })) as Suggestion[];
    return sugs;
  }

  const removeAirport = (airport: ActiveAirportsResponse) => {
    setSelected(selected.filter((a) => a.code !== airport.code));
  };

  const onInputChange = (event: any) => {
    const newValue = event.target.value;
    setInputValue(newValue);
  };
  const onSuggestionSelect = (event: any) => {
    const airport: ActiveAirportsResponse = event.suggestion.value;

    if (airport && selected.every((a) => a.code != airport.code)) {
      const newSelected = [...selected, airport];
      setSelected(newSelected);
      setInputValue('');
      onChange(newSelected);
    }
  };

  return (
    <Box gap="none">
      <Box fill align="start" justify="start">
        <Box width="medium" gap="medium">
          <TextInput
            size="small"
            icon={<Search />}
            value={inputValue}
            placeholder="Enter an airport ..."
            onChange={onInputChange}
            onSelect={onSuggestionSelect}
            suggestions={suggestions}
          />
        </Box>
      </Box>
      <Box flex={{ grow: 0, shrink: 0 }} direction="row" wrap pad="small">
        {selected.map((airport) => (
          <Box pad="xxsmall" key={airport.code}>
            <Tag
              value={airport.name}
              size="xsmall"
              onRemove={() => removeAirport(airport)}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default AirportSelector;
