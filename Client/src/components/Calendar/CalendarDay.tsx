import { memo, useCallback, useMemo } from "react";
import Button from "../Button";
import { DateTime } from "luxon";
import useScheduleStore from "../../stores/scheduleStore";

function isDateToday(date: DateTime) {
  const today = DateTime.local().startOf("day");
  return date.startOf("day").equals(today);
}

interface CalendarDayProps {
  date: DateTime;
  isDisabled: (date: DateTime) => boolean;
  isUnavailable: (date: DateTime) => boolean;
}

const CalendarDay = memo(
  ({ date, isDisabled, isUnavailable }: CalendarDayProps) => {
    const selectedDate = useScheduleStore((s) => s.selectedDate);
    const setSelectedDate = useScheduleStore(
      useCallback((s) => s.setSelectedDate, [])
    );

    const isDateSelected = selectedDate && date.equals(selectedDate);

    const getBadgeClasses = useMemo(() => {
      return [
        "w-full",
        (isDisabled(date) || isUnavailable(date)) && "badge-disabled",
        isDateToday(date) && "badge-current opacity-80",
        isDateSelected && "badge-selected",
      ]
        .filter(Boolean)
        .join(" ");
    }, [date, isDisabled, isDateSelected, isUnavailable]);

    return (
      <Button
        size="md"
        color="slate"
        variant="badge"
        disabled={isDisabled(date)}
        className={getBadgeClasses}
        onClick={() => setSelectedDate(date)}
      >
        {date.day}
      </Button>
    );
  }
);

export default CalendarDay;
CalendarDay.displayName = "CalendarDay";
