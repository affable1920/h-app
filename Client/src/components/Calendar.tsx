import { useState, useCallback } from "react";
import { DateTime } from "luxon";
import CalendarBody from "./CalendarBody";
import { ArrowRight, ArrowLeft } from "lucide-react";
import Button from "@/components/ui/Button";
import type { Schedule } from "@/types/http";
import { motion } from "motion/react";

const currDate = DateTime.local();
type Direction = "left" | "right";

const Calendar = ({ schedules }: { schedules: Schedule[] }) => {
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
      className="relative rounded-xl border-2 bg-layout border-border w-full md:max-w-110 
      shadow-lg shadow-black/30 p-6"
    >
      <header className="flex items-center justify-between px-2 mb-8">
        <h2 className="text-lg uppercase font-black">
          {monthInView.monthLong}
        </h2>

        <div className="flex flex-col gap-1">
          <Button
            variant="icon"
            onClick={handleMonthChange.bind(null, "right")}
          >
            <ArrowRight />
          </Button>

          <Button
            variant="icon"
            disabled={monthInView.month <= currDate.month}
            onClick={handleMonthChange.bind(null, "left")}
          >
            <ArrowLeft />
          </Button>
        </div>
      </header>

      <CalendarBody schedules={schedules} monthInView={monthInView} />
    </motion.section>
  );
};

export default Calendar;
