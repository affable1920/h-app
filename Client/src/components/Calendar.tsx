import { useState, useCallback } from "react";
import { DateTime } from "luxon";
import CalendarBody from "./CalendarBody";
import { ArrowRight, ArrowLeft } from "lucide-react";
import Button from "@/components/ui/Button";
import type { Schedule } from "@/types/http";
import { motion } from "motion/react";

const currDate = DateTime.local();
type Direction = "left" | "right";

const Calendar = ({
  schedules,
}: {
  schedules: Schedule[];
  shouldMove: boolean;
}) => {
  const [monthInView, setMonthInView] = useState<DateTime>(DateTime.local());

  const handleMonthChange = useCallback(
    function (dir: Direction) {
      const currMonth = monthInView.month;

      const max = 12,
        min = 1;

      let newMonth = dir === "right" ? currMonth + 1 : currMonth - 1;

      if (newMonth < min) return;
      if (newMonth > max) newMonth = min;

      setMonthInView((p) => p.set({ month: newMonth }));
    },
    [monthInView],
  );

  return (
    <motion.section
      layout
      className="relative shadow-lg shadow-slate-300/40 rounded-xl border-2 border-slate-300/20 w-full md:max-w-110"
    >
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
    </motion.section>
  );
};

export default Calendar;
