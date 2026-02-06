import { memo, useState, useCallback } from "react";
import { DateTime } from "luxon";
import CalendarBody from "./CalendarBody";
import { motion, type Variant } from "motion/react";
import { Info, ArrowRight, ArrowLeft } from "lucide-react";
import Button from "@components/common/Button";
import type { Schedule } from "@/types/http";

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

const Calendar = memo(({ schedules }: { schedules: Schedule[] }) => {
  const [showInfo, setShowInfo] = useState(false);
  const [monthInView, setMonthInView] = useState<DateTime>(DateTime.local());

  const handleMonthChange = useCallback(
    (dir: Direction) => {
      const currMonth = monthInView.month;

      const max = 12,
        min = 1;

      let newMonth = dir === "right" ? currMonth + 1 : currMonth - 1;

      if (newMonth < 1) return;
      if (newMonth === max) newMonth = min;

      setMonthInView((p) => p.set({ month: newMonth }));
    },
    [monthInView],
  );

  return (
    <section className="box relative gap-6">
      <header className="flex flex-col">
        <div
          className="absolute right-2 top-1 flex items-center justify-end overflow-hidden 
        italic font-bold text-sm gap-2 text-sky-900 opacity-75 selection:bg-transparent"
        >
          <motion.p
            initial={false}
            variants={variants}
            transition={{ duration: 0.1 }}
            animate={showInfo ? "visible" : "hidden"}
          >
            Select any day that fits your schedule
          </motion.p>

          <Button
            size="xs"
            variant="icon"
            onClick={() => setShowInfo((prev) => !prev)}
          >
            <Info />
          </Button>
        </div>

        <article className="flex items-center justify-between">
          <motion.h2 className="card-h2 text-lg uppercase font-black">
            {monthInView.monthLong}
          </motion.h2>

          <div className="flex flex-col">
            <Button
              size="xs"
              variant="icon"
              onClick={handleMonthChange.bind(null, "right")}
            >
              <ArrowRight />
            </Button>

            <Button
              size="xs"
              variant="icon"
              disabled={monthInView.month <= currDate.month}
              onClick={handleMonthChange.bind(null, "left")}
            >
              <ArrowLeft />
            </Button>
          </div>
        </article>
      </header>

      <CalendarBody schedules={schedules} monthInView={monthInView} />
    </section>
  );
});

export default Calendar;
