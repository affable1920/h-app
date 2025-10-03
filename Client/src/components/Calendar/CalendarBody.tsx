import React, { useCallback, useMemo } from "react";
import { DateTime } from "luxon";

import { DAYS_OF_WEEK } from "../../types/constants";

import useDocStore from "../../stores/doctorsStore";
import useScheduleStore from "../../stores/scheduleStore";

import { ImCross } from "react-icons/im";
import { createCalendarData } from "../../utilities/calendarUtils";

import { AnimatePresence, motion, type Variant } from "motion/react";
const variants: Record<string, Variant> = {
  initial: {
    x: 100,
    opacity: 0,
  },
  animate: {
    x: 0,
    opacity: 100,
  },
  exit: {
    x: -100,
    opacity: 0,
  },
};

interface BodyProps {
  dateInView: DateTime;
  direction?: "right" | "left";
}

const today = DateTime.local();

const isDateToday = (date: DateTime) => {
  return date.day === today.day && date.month === today.month;
};

const CalendarBody = React.memo(({ dateInView, direction }: BodyProps) => {
  const selectedDate = useScheduleStore((s) => s.selectedDate);
  const setSelectedDate = useScheduleStore((s) => s.setSelectedDate);

  const clinics = useDocStore((s) => s.currDoctor?.clinics);
  const calendar = useMemo(() => createCalendarData(dateInView), [dateInView]);

  const getBadgeClass = useCallback(
    (date: DateTime) => {
      const classConfig = [
        "badge",
        "w-full",

        isDateToday(date) && "badge-current opacity-80",
        date.month < dateInView.month && "badge-disabled",
        date.month > dateInView.month && "badge-choice",
        date === selectedDate && "badge-selected",
        "disabled:badge-disabled",
      ]
        .filter(Boolean)
        .join(" ");

      return classConfig;
    },
    [dateInView.month, selectedDate]
  );

  const availableDays = useMemo(
    () =>
      new Set(
        clinics
          ?.map((cl) =>
            Object.keys?.({ ...cl.schedule }).map((d) => d?.toLowerCase())
          )
          .flat()
      ),
    [clinics]
  );

  const isDisabled = useCallback(
    (weekday: string) => !availableDays.has(weekday),
    [availableDays]
  );

  return (
    <div className="grid gap-6 grid-cols-7 justify-items-center">
      {DAYS_OF_WEEK.map((day, i) => (
        <h2
          key={i}
          className={`opacity-80 font-black underline-offset-4  ${
            day.toLowerCase() === dateInView.weekdayLong?.toLowerCase()
              ? "text-accent-dark underline font-black"
              : ""
          }`}
        >
          {day.slice(0, 3)}
        </h2>
      ))}
      {calendar.map((date, index) => {
        const wkday = date.weekdayLong?.toLowerCase() as string;
        return (
          <AnimatePresence mode="wait" custom={direction}>
            <motion.button
              layout
              key={index}
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              disabled={isDisabled(wkday)}
              onClick={() => setSelectedDate(date)}
              className={getBadgeClass(date) + " relative"}
            >
              {date.day}
              {isDisabled(wkday) && (
                <ImCross className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              )}
            </motion.button>
          </AnimatePresence>
        );
      })}
    </div>
  );
});

export default CalendarBody;
