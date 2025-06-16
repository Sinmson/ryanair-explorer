import { useState } from 'react';
import { Box, RangeSelector, Text } from 'grommet';

const DaysSelector = ({
  minDays,
  maxDays,
  onChange
}: {
  minDays: number;
  maxDays: number;
  onChange: (daysRange: { start: number; end: number }) => void;
}) => {
  const [values, setValues] = useState<[number, number]>([minDays, maxDays]);

  return (
    <Box gap="medium">
      <Box direction="row" gap="medium" align="center">
        <Text size="small" weight="bold">
          {values[0]} days
        </Text>
        <RangeSelector
          invert={false}
          round="small"
          min={minDays}
          max={maxDays}
          step={1}
          values={values}
          onChange={(newValues) => {
            if (Array.isArray(newValues) && newValues.length === 2) {
              const [start, end] = newValues as [number, number];
              setValues([start, end]);
              onChange({ start, end });
            }
          }}
        />
        <Text size="small" weight="bold">
          {values[1]} days
        </Text>
      </Box>
    </Box>
  );
};

export default DaysSelector;
