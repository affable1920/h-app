import { memo } from "react";
import { DateTime } from "luxon";

import Badge from "@components/common/Badge";
import { useSchedule } from "./providers/ScheduleProvider";

function isDateToday(date: DateTime) {
  return date.startOf("day").equals(DateTime.now().startOf("day"));
}

function areDatesEqual(dtA: DateTime, dtB: DateTime) {
  return dtA.startOf("day").equals(dtB.startOf("day"));
}

interface CalendarDayProps {
  date: DateTime;
  disabled?: boolean;
}

const CalendarDay = memo(({ ...props }: CalendarDayProps) => {
  const { date, disabled = false } = props;
  const {
    state,
    actions: { setDate },
  } = useSchedule();

  function getTooltipText() {
    return !disabled ? "Available" : "No schedules available on this date";
  }

  return (
    <Badge
      rotate
      as="button"
      color="slate"
      disabled={disabled}
      current={isDateToday(date)}
      content={date.day.toString()}
      data-tooltip={getTooltipText()}
      onClick={() => setDate(date)}
      selected={state.date ? areDatesEqual(state.date, date) : false}
    />
  );
});

export default CalendarDay;
CalendarDay.displayName = "CalendarDay";
