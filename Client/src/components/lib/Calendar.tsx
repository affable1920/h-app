import { ArrowLeft, ArrowRight } from "lucide-react";
import { DateTime } from "luxon";
import { memo, useMemo, type ReactNode } from "react";
import { WEEKDAYS } from "@/utils/constants";
import {
  createCalendar,
  isDateInPast,
  isDateToday,
} from "@/domain/scheduling/utils";
import Badge from "../ui/Badge";
import Button from "../ui/Button";

const local = DateTime.local();

export function CalendarHeader({
  viewMonth,
  onNext,
  onPrevious,
}: {
  viewMonth: DateTime<true>;
  onNext: () => void;
  onPrevious: () => void;
}) {
  return (
    <header className="flex items-center justify-between mb-10">
      <h2 className="text-lg uppercase font-bold">{viewMonth.monthLong}</h2>

      <div className="flex flex-col gap-1">
        <Button
          variant="icon"
          aria-label="next-month"
          data-tooltip="next month"
          onClick={onNext}
        >
          <ArrowRight />
        </Button>

        <Button
          variant="icon"
          aria-label="previous-month"
          data-tooltip="previous month"
          disabled={viewMonth.month <= local.month}
          onClick={onPrevious}
        >
          <ArrowLeft />
        </Button>
      </div>
    </header>
  );
}

interface CalendarContentProps {
  viewMonth: DateTime<true>;
  availableDateKeys: Array<DateTime>;
  selectedDate: DateTime | null;
  unavailableDateKeys?: Array<DateTime>;
  onSelectDate: (next: DateTime) => void;
}

export const CalendarContent = memo(function ({
  viewMonth,
  selectedDate,
  onSelectDate,
  availableDateKeys = [],
}: CalendarContentProps) {
  const calendar = useMemo(
    function () {
      return createCalendar(viewMonth);
    },
    [viewMonth],
  );

  function isWkdayToday(day: (typeof WEEKDAYS)[number]) {
    return (
      viewMonth.month === local.month &&
      day.toLowerCase().trim() === local.weekdayLong.toLowerCase().trim()
    );
  }

  return (
    <div className={`flex flex-col gap-6`}>
      <div className="grid gap-4 justify-items-center grid-cols-7">
        {WEEKDAYS.map(function (weekday) {
          return (
            <h2
              key={weekday}
              className={`font-bold underline-offset-4 capitalize  ${
                isWkdayToday(weekday)
                  ? "text-text-secondary underline"
                  : "text-text-secondary/80"
              }`}
            >
              {weekday.slice(0, 3)}
            </h2>
          );
        })}
      </div>

      <div className="grid gap-4 justify-items-center grid-cols-7 gap-y-6">
        {calendar.map(function (dt) {
          return (
            <Badge
              className="size-9 md:size-10"
              onClick={function () {
                onSelectDate(dt);
              }}
              current={isDateToday(dt)}
              key={dt.toISO()}
              selected={dt === selectedDate}
              disabled={isDateInPast(dt) || !availableDateKeys.includes(dt)}
            >
              {dt.day.toString()}
            </Badge>
          );
        })}
      </div>
    </div>
  );
});

export function CalendarLegend() {
  return (
    <footer className="flex justify-end items-center gap-2 [&>span]:p-1.25">
      <Badge as="span" full={false} data-tooltip="AVAILABLE" />
      <Badge
        as="span"
        full={false}
        disabled={true}
        data-tooltip="UNAVAILABLE"
        className="pointer-events-auto!"
      />
      <Badge as="span" full={false} data-tooltip="TODAY" current={true} />
      <Badge as="span" full={false} data-tooltip="SELECTED" selected={true} />
    </footer>
  );
}

function CalendarWrapper({ children }: { children: ReactNode }) {
  return (
    <section
      className="
        relative rounded-xl border bg-layout border-border-strong w-full md:max-w-110 
      shadow-md shadow-black/25 p-6 pb-3 space-y-8"
    >
      {children}
    </section>
  );
}

export const Calendar = Object.assign(CalendarWrapper, {
  Header: CalendarHeader,
  Content: CalendarContent,
  Legend: CalendarLegend,
});
