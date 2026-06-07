import { useMemo } from "react";

import { DateTime } from "luxon";
import { WEEKDAYS } from "@/utils/constants";
import type { Schedule } from "@/types/http";
import {
  createCalendarData,
  datesAreEqual,
  isDateInPast,
  isDateToday,
} from "@/utils/utils";
import { useSearchParams } from "react-router-dom";
import Badge from "./ui/Badge";
import { motion } from "motion/react";

interface CalendarBodyProps {
  monthInView: DateTime;
  schedules: Schedule[];
  direction?: "right" | "left";
}

const CalendarBody = ({ schedules, monthInView }: CalendarBodyProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dtParam = DateTime.fromISO(searchParams.get("date") ?? "");

  function updateDate(dt: DateTime<true>) {
    setSearchParams(function (prev) {
      const next = new URLSearchParams(prev);

      if (datesAreEqual(dt, dtParam)) {
        next.delete("date");
        return next;
      } else {
        next.set("date", dt.toISO());
      }
      return next;
    });
  }

  const calendar = useMemo(
    function () {
      return createCalendarData(monthInView);
    },
    [monthInView],
  );

  const allScheduleDays = useMemo(function () {
    const days = [];

    for (let schedule of schedules) {
      days.push(schedule.weekdays);
    }

    return [...new Set(days.flat())].sort((a, b) => a - b);
  }, []);

  function isWkdayToday(day: (typeof WEEKDAYS)[number]) {
    const now = DateTime.local();

    return (
      monthInView.month === now.month &&
      day.toLowerCase().trim() === now.weekdayLong.toLowerCase().trim()
    );
  }

  return (
    <motion.div className={`flex flex-col gap-6`}>
      <div className="grid gap-4 justify-items-center grid-cols-7">
        {WEEKDAYS.map((day) => (
          <h2
            key={day}
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
        {calendar.map((dt) => {
          return (
            <Badge
              className="size-10 max-w-12 max-h-12"
              content={dt.day.toString()}
              onClick={function () {
                updateDate(dt);
              }}
              current={isDateToday(dt)}
              key={dt.toISO()}
              selected={datesAreEqual(dt, dtParam)}
              disabled={
                !allScheduleDays.includes(dt.weekday) || isDateInPast(dt)
              }
            />
          );
        })}
      </div>
    </motion.div>
  );
};

export default CalendarBody;
CalendarBody.displayName = "CalendarBody";
