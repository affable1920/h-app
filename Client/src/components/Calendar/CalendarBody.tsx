import { memo, useMemo } from "react";

import { DateTime } from "luxon";
import CalendarDay from "./CalendarDay";

import { WEEKDAYS } from "@/utils/constants";
import type { Schedule } from "@/types/doctorAPI";
import { createCalendarData } from "../../utils/calendarUtils";

interface CalendarBodyProps {
  monthInView: DateTime;
  schedules: Schedule[];
  direction?: "right" | "left";
}

const today = DateTime.local();

const CalendarBody = memo(({ schedules, monthInView }: CalendarBodyProps) => {
  const calendar = useMemo(
    function () {
      return createCalendarData(monthInView);
    },
    [monthInView]
  );

  const availableDays = useMemo(
    function () {
      return schedules?.map((s) => s.weekday) || [];
    },
    [schedules]
  );

  function isDateGone(diffDate: DateTime) {
    return diffDate.month < monthInView.month || diffDate.day < monthInView.day;
  }

  const rows = calendar.length < 42 ? 5 : 6;
  const classConfig = `grid gap-6 justify-items-center grid-cols-7 grid-rows-${rows} min-h-96`;

  return (
    <div className={classConfig}>
      {WEEKDAYS.map((day, i) => (
        <h2
          key={i}
          className={`opacity-80 font-black underline-offset-4 capitalize  ${
            day.toLowerCase() === monthInView.weekdayLong?.toLowerCase() &&
            monthInView.month === today.month
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
            date={date}
            key={`${date.day}-${date.month}-${date.year}`}
            disabled={isDateGone(date) || !availableDays.includes(date.weekday)}
          />
        );
      })}
    </div>
  );
});

export default CalendarBody;
CalendarBody.displayName = "CalendarBody";
