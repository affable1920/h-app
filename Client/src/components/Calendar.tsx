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
    <section className="relative shadow-xl shadow-slate-300/40 rounded-xl border border-slate-400/20">
      <div className="flex flex-col gap-8 p-4 py-6">
        <header className="flex items-center justify-between px-2">
          <h2 className="text-lg uppercase font-black">
            {monthInView.monthLong}
          </h2>

          <div className="flex flex-col gap-0.5">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleMonthChange.bind(null, "right")}
            >
              <ArrowRight />
            </Button>

            <Button
              size="sm"
              variant="ghost"
              disabled={monthInView.month <= currDate.month}
              onClick={handleMonthChange.bind(null, "left")}
            >
              <ArrowLeft />
            </Button>
          </div>
        </header>

        <CalendarBody schedules={schedules} monthInView={monthInView} />
      </div>
    </section>
  );
});

export default Calendar;
