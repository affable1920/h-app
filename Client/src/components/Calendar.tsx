import { useState, useCallback } from "react";
import { DateTime } from "luxon";
import CalendarBody from "./CalendarBody";
import { ArrowRight, ArrowLeft } from "lucide-react";
import Button from "@/components/ui/Button";
import type { Schedule } from "@/types/http";
import { motion } from "motion/react";
import Badge from "./ui/Badge";

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
    <section
      className="relative rounded-xl border-2 bg-layout border-border w-full md:max-w-110 
      shadow-md shadow-black/20 p-6 pb-3"
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

      <footer className="flex justify-end items-center gap-2 mt-8 [&>span]:p-1.5">
        <Badge as="span" full={false} data-tooltip="AVAILABLE" />
        <Badge
          as="span"
          full={false}
          disabled
          data-tooltip="UNAVAILABLE"
          className="pointer-events-auto!"
        />
        <Badge as="span" full={false} data-tooltip="TODAY" current />
        <Badge as="span" full={false} data-tooltip="SELECTED" selected />
      </footer>
    </section>
  );
};

export default Calendar;
