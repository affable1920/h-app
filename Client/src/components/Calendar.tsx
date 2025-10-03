import React from "react";
import { DateTime } from "luxon";
import { useState, useCallback } from "react";
import CalendarBody from "./Calendar/CalendarBody";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";
import { AnimatePresence, motion } from "motion/react";

const currDate = DateTime.local();
type Direction = "left" | "right";

const Calendar = React.memo(() => {
  const [dateInView, setDateInView] = useState<DateTime>(DateTime.local());

  const handleMonthChange = useCallback(
    (dir: Direction) => {
      const newMonth =
        dir === "right" ? dateInView.month + 1 : dateInView.month - 1;
      if (newMonth < 1 || newMonth > 12) return;

      setDateInView((p) =>
        DateTime.local().set({
          year: p.year,
          month: newMonth,
        })
      );
    },
    [dateInView]
  );

  return (
    <section className="box">
      <header className="flex justify-between overflow-hidden items-center w-full px-1">
        <AnimatePresence mode="wait">
          <motion.h2 className="card-h2 text-lg uppercase font-black">
            {dateInView.monthLong}
          </motion.h2>
        </AnimatePresence>
        <div className="flex flex-col">
          <BsArrowRight
            className="cursor-pointer"
            onClick={handleMonthChange.bind(null, "right")}
          />
          <BsArrowLeft
            className={`${
              dateInView.month > currDate.month
                ? "cursor-pointer pointer-events-auto select-auto opacity-100"
                : "cursor-default pointer-events-none select-none opacity-60"
            }`}
            aria-disabled={dateInView.month >= currDate.month}
            onClick={handleMonthChange.bind(null, "left")}
          />
        </div>
      </header>

      <CalendarBody dateInView={dateInView} />
    </section>
  );
});

export default Calendar;
