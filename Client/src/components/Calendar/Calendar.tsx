import { memo, useState, useCallback } from "react";
import { DateTime } from "luxon";
import CalendarBody from "./CalendarBody";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";
import { AnimatePresence, motion, type Variant } from "motion/react";
import { IoInformationCircleSharp } from "react-icons/io5";

const currDate = DateTime.local();
type Direction = "left" | "right";

const variants: Record<string, Variant> = {
  hidden: {
    x: 100,
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
  },
};

const Calendar = memo(() => {
  const [dateInView, setDateInView] = useState<DateTime>(DateTime.local());
  const [showInfo, setShowInfo] = useState(false);

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
    <section className="box relative">
      <div className="absolute right-2 top-1 flex items-center justify-end overflow-hidden italic font-bold text-sm gap-2 text-sky-900 opacity-75 selection:bg-transparent">
        <motion.p
          initial={false}
          variants={variants}
          transition={{ duration: 0.1 }}
          animate={showInfo ? "visible" : "hidden"}
        >
          Select any day that fits your schedule
        </motion.p>
        <IoInformationCircleSharp
          className="cursor-pointer z-1"
          onClick={() => setShowInfo((prev) => !prev)}
        />
      </div>

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
