import { ArrowLeft, ArrowRight } from "lucide-react";
import { DateTime } from "luxon";
import { memo, useMemo, type ReactNode } from "react";
import { WEEKDAYS } from "@/utils/constants";
import {
  areEqual,
  createCalendar,
  isDateInPast,
  isDateToday,
} from "@/domain/scheduling/utils";
import Badge from "../ui/Badge";
import Button from "./button/Button";

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
          disabled={viewMonth.startOf("month") <= local.startOf("month")}
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

  function isWeedkdayToday(day: (typeof WEEKDAYS)[number]) {
    return (
      viewMonth.month === local.month &&
      day.toLowerCase().trim() === local.weekdayLong.toLowerCase().trim()
    );
  }

  return (
    <div className={`flex flex-col gap-6`}>
      <div className="grid gap-4 justify-items-center grid-cols-7">
        {WEEKDAYS.map(function (weekday) {
          const isToday = isWeedkdayToday(weekday);

          return (
            <h2
              key={weekday}
              className={`font-bold underline-offset-4 capitalize  ${
                isToday
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
          const isToday = isDateToday(dt);
          const isSelected =
            selectedDate !== null && areEqual(dt, selectedDate);

          const isAvailable = availableDateKeys.some(function (availableDate) {
            return areEqual(dt, availableDate);
          });

          const isDisabled = isDateInPast(dt) || !isAvailable;

          return (
            <Badge
              as="button"
              className={`size-9 md:size-10 ${isToday ? "border-b-2 border-b-brand" : ""}`}
              onClick={function () {
                onSelectDate(dt);
              }}
              aria-current={isToday ? "date" : undefined}
              aria-label={dt.toLocaleString(DateTime.DATE_FULL)}
              key={dt.toISO()}
              selected={isSelected}
              aria-pressed={isSelected}
              disabled={isDisabled}
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
    <ul
      aria-label="calendar legend"
      className="flex flex-wrap justify-end items-center gap-2 [&>li_span]:p-2 [&>li]:text-xs [&>li]:flex [&>li]:items-center [&>li]:gap-1"
    >
      <li>
        <Badge aria-hidden="true" as="span" />
        <span>Available</span>
      </li>

      <li>
        <Badge
          aria-hidden="true"
          as="span"
          className="opacity-80 shadow-none"
        />
        <span>Unavailable</span>
      </li>
      <li>
        <Badge
          as="span"
          aria-hidden="true"
          className="border-b-2 border-b-brand"
        />
        <span>Today</span>
      </li>
      <li>
        <Badge as="span" aria-hidden="true" selected={true} />
        <span>Selected</span>
      </li>
    </ul>
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
