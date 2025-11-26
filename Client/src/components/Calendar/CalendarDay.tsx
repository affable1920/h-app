import { memo } from "react";
import { DateTime } from "luxon";

import Badge from "../eventElements/Badge";
import useScheduleStore from "../../stores/scheduleStore";

function isDateToday(date: DateTime) {
  return date.startOf("day").equals(DateTime.now().startOf("day"));
}

interface CalendarDayProps {
  date: DateTime;
  disabled?: boolean;
}

const CalendarDay = memo(({ ...props }: CalendarDayProps) => {
  const { date, disabled = false } = props;

  const selectedDate = useScheduleStore((s) => s.selectedDate);
  const setSelectedDate = useScheduleStore((s) => s.setSelectedDate);

  function getTooltipText() {
    return !disabled ? "Available" : "No schedules available on this date";
  }

  return (
    <Badge
      as="button"
      color="slate"
      disabled={disabled}
      current={isDateToday(date)}
      content={date.day.toString()}
      data-tooltip={getTooltipText()}
      onClick={() => setSelectedDate(date)}
      selected={selectedDate?.startOf("day")?.equals(date.startOf("day"))}
    />
  );
});

export default CalendarDay;
CalendarDay.displayName = "CalendarDay";
