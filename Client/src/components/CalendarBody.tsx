import { memo, useMemo } from "react";

import { DateTime } from "luxon";
import CalendarDay from "./CalendarDay";

import { WEEKDAYS } from "@/utils/constants";
import type { Schedule } from "@/types/doctorAPI";
import { createCalendarData } from "@/utils/calendarUtils";

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

  const allScheduleDays = useMemo(
    function () {
      const days = [];

      for (let schedule of schedules) {
        days.push(schedule.weekdays);
      }

      return days.flat().sort((a, b) => a - b);
    },
    [schedules]
  );

  function isDateGone(date: DateTime) {
    return (
      date.month < monthInView.month ||
      (date.month === monthInView.month && date.day < monthInView.day)
    );
  }

  function isWkdayToday(day: (typeof WEEKDAYS)[number]) {
    return (
      day.toLowerCase() === today.weekdayLong?.toLowerCase() &&
      monthInView.month === today.month
    );
  }

  const rows = calendar.length < 42 ? 5 : 6;
  const classConfig = `grid gap-6 justify-items-center grid-cols-7 grid-rows-${rows} min-h-96`;

  return (
    <div className={classConfig}>
      {WEEKDAYS.map((day, i) => (
        <h2
          key={i}
          className={`opacity-80 font-black underline-offset-4 capitalize  ${
            isWkdayToday(day) ? "text-accent-dark underline font-black" : ""
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
            disabled={
              isDateGone(date) || !allScheduleDays.includes(date.weekday)
            }
          />
        );
      })}
    </div>
  );
});

export default CalendarBody;
CalendarBody.displayName = "CalendarBody";
