import { useMemo } from "react";

import { DateTime } from "luxon";
import CalendarDay from "./CalendarDay";

import { WEEKDAYS } from "@/utils/dataConstants";
import type { Schedule } from "@/types/http";
import { createCalendarData } from "@/utils/calendarUtils";
import { useSearchParams } from "react-router-dom";

interface CalendarBodyProps {
  monthInView: DateTime;
  schedules: Schedule[];
  direction?: "right" | "left";
}

function isDateToday(date: DateTime) {
  return date.startOf("day").equals(DateTime.local().startOf("day"));
}

function isInPast(dt: DateTime) {
  return dt.toLocal().startOf("day") < DateTime.local().startOf("day");
}

function areDatesEqual(dtA: DateTime, dtB: DateTime) {
  return dtA.hasSame(dtB, "day");
}

const CalendarBody = ({ schedules, monthInView }: CalendarBodyProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dtParam = DateTime.fromISO(searchParams.get("date") ?? "");

  function updateDate(dt: DateTime<true>) {
    setSearchParams(function (prev) {
      const next = new URLSearchParams(prev);

      if (areDatesEqual(dtParam, dt)) {
        next.delete("date");
        return next;
      }

      next.set("date", dt.toISO());
      return next;
    });
  }

  const calendar = useMemo(
    function () {
      return createCalendarData(monthInView);
    },
    [monthInView],
  );

  const allScheduleDays = useMemo(
    function () {
      const days = [];

      for (let schedule of schedules) {
        days.push(schedule.weekdays);
      }

      return [...new Set(days.flat())].sort((a, b) => a - b);
    },
    [schedules],
  );

  function isWkdayToday(day: (typeof WEEKDAYS)[number]) {
    const currDt = DateTime.local();

    return (
      monthInView.month === currDt.month &&
      day.toLowerCase().trim() === currDt.weekdayLong.toLowerCase().trim()
    );
  }

  const rows = calendar.length < 42 ? 5 : 6;
  const classConfig = `grid gap-4 justify-items-center grid-cols-7 grid-rows-${rows} min-h-96`;

  return (
    <div className={classConfig}>
      {WEEKDAYS.map((day, i) => (
        <h2
          key={i}
          className={`opacity-80 font-black underline-offset-4 capitalize  ${
            isWkdayToday(day) ? "text-accent-dark underline" : ""
          }`}
        >
          {day.slice(0, 3)}
        </h2>
      ))}

      {calendar.map((date) => {
        return (
          <CalendarDay
            date={date}
            onClick={updateDate.bind(null, date)}
            current={isDateToday(date)}
            key={date.toISO()}
            selected={areDatesEqual(date, dtParam)}
            disabled={isInPast(date) || !allScheduleDays.includes(date.weekday)}
          />
        );
      })}
    </div>
  );
};

export default CalendarBody;
CalendarBody.displayName = "CalendarBody";
