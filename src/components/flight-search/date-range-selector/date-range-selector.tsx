import { Box, DateInput, Text } from 'grommet';
import { useState } from 'react';
import { DateRange } from "../../../types/ryanair";



const DateRangeSelector = ({value, onChange}: { value: DateRange, onChange: (dateRange: DateRange) => void }) => {
  const [internalValue, setValue] = useState([
    value.start.toISOString(),
    value.end.toISOString(),
  ]);
  const onDateInputChange = (event: { value: any }) => {
    const nextValue = event.value;
    const startDate = new Date(nextValue[0]);
    const endDate = new Date(nextValue[1]);
    console.log('onChange iso date:', nextValue);
    console.log('onChange utc date:', startDate, endDate);
    setValue(nextValue);
    onChange({
      start: startDate,
      end: endDate
    });
  };
  return (
    <DateInput
      inline={false}
      value={internalValue}
      format="dd.mm.yyyy - dd.mm.yyyy"
      onChange={onDateInputChange}
      reverse={true}
      calendarProps={{
        size: 'small',
        fill: false,
        daysOfWeek: true,
        firstDayOfWeek: 1,
        showAdjacentDays: true,
      }}
      dropProps={{}}
      inputProps={{
        size: 'xsmall',
        focusIndicator: false,
      }}
      buttonProps={{
        size: 'large',
        focusIndicator: false,
      }}
    />
  );
};

export default DateRangeSelector;
