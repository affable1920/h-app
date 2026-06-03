import { useMemo } from "react";

import { DateTime } from "luxon";
import { WEEKDAYS } from "@/utils/constants";
import type { Schedule } from "@/types/http";
import { createCalendarData } from "@/utils/utils";
import { useSearchParams } from "react-router-dom";
import Badge from "./ui/Badge";

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

  return (
    <div className={`flex flex-col gap-6`}>
      <div className="grid gap-4 justify-items-center grid-cols-7">
        {WEEKDAYS.map((day, i) => (
          <h2
            key={i}
            className={`font-black underline-offset-4 capitalize  ${
              isWkdayToday(day)
                ? "text-text-secondary underline"
                : "text-text-secondary/80"
            }`}
          >
            {day.slice(0, 3)}
          </h2>
        ))}
      </div>

      <div className="grid gap-4 grid-cols-7 gap-y-6 justify-items-center">
        {calendar.map((date) => {
          return (
            <Badge
              className="size-10 max-w-12 max-h-12"
              content={date.day.toString()}
              onClick={function () {
                updateDate(date);
              }}
              current={isDateToday(date)}
              key={date.toISO()}
              selected={areDatesEqual(date, dtParam)}
              disabled={
                isInPast(date) || !allScheduleDays.includes(date.weekday)
              }
            />
          );
        })}
      </div>
    </div>
  );
};

export default CalendarBody;
CalendarBody.displayName = "CalendarBody";
