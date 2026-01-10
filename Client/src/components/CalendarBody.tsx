import { memo, useCallback, useMemo } from "react";

import { DateTime } from "luxon";
import CalendarDay from "./CalendarDay";

import { WEEKDAYS } from "@/utils/constants";
import type { Schedule } from "@/types/doctorAPI";
import { createCalendarData } from "@/utils/calendarUtils";
import { useSchedule } from "./providers/ScheduleProvider";

interface CalendarBodyProps {
  monthInView: DateTime;
  schedules: Schedule[];
  direction?: "right" | "left";
}

const today = DateTime.local();

function isDateToday(date: DateTime) {
  return date.startOf("day").equals(today.startOf("day"));
}

function areDatesEqual(dtA: DateTime, dtB: DateTime) {
  return dtA.startOf("day").equals(dtB.startOf("day"));
}

const CalendarBody = memo(({ schedules, monthInView }: CalendarBodyProps) => {
  const { state } = useSchedule();

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

      return [...new Set(days.flat())].sort((a, b) => a - b);
    },
    [schedules]
  );

  const isDateGone = useCallback(function isDateGone(date: DateTime) {
    const isFromPrevYear = date.year < today.year;
    const isFromPrevMonth = date.month < today.month;
    const hasDayPassed = date.day < today.day;

    return (
      isFromPrevYear ||
      isFromPrevMonth ||
      (date.month === today.month && hasDayPassed)
    );
  }, []);

  function isWkdayToday(day: (typeof WEEKDAYS)[number]) {
    return (
      day.toLowerCase().trim() === today.weekdayLong?.toLowerCase().trim() &&
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
            current={isDateToday(date)}
            key={`${date.day}-${date.month}-${date.year}`}
            selected={state.date ? areDatesEqual(date, state.date) : false}
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
