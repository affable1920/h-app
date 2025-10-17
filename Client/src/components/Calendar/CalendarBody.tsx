import React, { useCallback, useMemo } from "react";
import { DateTime } from "luxon";
import CalendarDay from "./CalendarDay";
import { DAYS_OF_WEEK, type Weekday } from "../../utils/constants";
import { createCalendarData } from "../../utils/calendarUtils";
import useDoctorsStore from "../../stores/doctorsStore";

interface BodyProps {
  dateInView: DateTime;
  direction?: "right" | "left";
}

const today = DateTime.local();

const CalendarBody = React.memo(({ dateInView }: BodyProps) => {
  const calendar = useMemo(() => createCalendarData(dateInView), [dateInView]);

  const isDisabled = useCallback(
    (date: DateTime) => {
      return date.month < dateInView.month && dateInView.month === today.month;
    },
    [dateInView]
  );

  const schedules = useDoctorsStore((s) => s.currDoctor?.schedules);
  const availableDays = useMemo(
    () => schedules?.map((s) => s.weekday) || [],
    [schedules]
  );

  const isUnavailable = useCallback(
    (date: DateTime) => {
      return !availableDays?.includes(
        date.weekdayLong?.toLowerCase() as Weekday
      );
    },
    [availableDays]
  );

  const rows = calendar.length < 42 ? 5 : 6;
  const classConfig = `grid gap-6 justify-items-center grid-cols-7 grid-rows-${rows} min-h-96`;

  return (
    <>
      <div className={classConfig}>
        {DAYS_OF_WEEK.map((day, i) => (
          <h2
            key={i}
            className={`opacity-80 font-black underline-offset-4  ${
              day.toLowerCase() === dateInView.weekdayLong?.toLowerCase() &&
              dateInView.month === today.month
                ? "text-accent-dark underline font-black"
                : ""
            }`}
          >
            {day.slice(0, 3)}
          </h2>
        ))}
        {calendar.map((date) => {
          return (
            <CalendarDay
              key={`${date.day}-${date.month}-${date.year}`}
              date={date}
              isDisabled={isDisabled}
              isUnavailable={isUnavailable}
            />
          );
        })}
      </div>
    </>
  );
});

export default CalendarBody;
CalendarBody.displayName = "CalendarBody";
