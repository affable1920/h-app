import { DateTime, type DateTimeUnit } from "luxon";
import { WEEKDAYS } from "./constants";
import { toast, type ExternalToast } from "sonner";

function getPreviousMonthDays(dt: DateTime<true>): DateTime[] {
  /**
   * currMonthStartday gives us a weekday 1 - 7 => 1 - Monday and 7 - Sunday
   * subtracting 1 from the start day, we get days count to be filled with prev month last days
   * if 0 => return and start the calendar from the current month
   *
   * Subtracting fillPrevMonth from countPrevMonth - total days in the prev month
   * we get the day of the last month we need to start the calendar with,
   * which we loop over and, create an array from and return
   */

  const currMonthStartDay = dt.set({ day: 1 }).weekday;
  const fillPrevMonth = currMonthStartDay - 1;

  if (fillPrevMonth === 0) {
    return [];
  }

  const countPrevMonth = dt.set({ month: dt.month - 1 }).daysInMonth;

  const daysFromPrevMonth = countPrevMonth - fillPrevMonth;
  // daysFromPrevMonth gives a valid count implying the number of prev month's days to be used
  // for example - prev month had 31 days and 2 days were required from it,
  // i,e 31 - 2 = 29, inside the loop, that'd be 29, 30 and 31 => 3 numbers

  // i,e inclusive of the starting date (out of the whole fill) -
  // use daysFromPrevMonth + 1 as the starting point for the previous month's fill

  const prevMonthDays: DateTime[] = [];

  for (let i = daysFromPrevMonth + 1; i <= countPrevMonth; i++) {
    prevMonthDays.push(dt.set({ month: dt.month - 1, day: i }));
  }

  return prevMonthDays;
}

function getNextMonthDays(
  currLength: number,
  currDt: DateTime<true>,
): DateTime[] {
  const daysFromNextMonth = currLength % 7 === 0 ? 0 : 7 - (currLength % 7);

  return Array.from({ length: daysFromNextMonth }, (_, i) =>
    currDt.set({ month: currDt.month + 1, day: i + 1 }),
  );
}

export function createCalendarData(dt: DateTime<true>): DateTime[] {
  const prevMonthDays = getPreviousMonthDays(dt);
  const countCurrMonth = dt.daysInMonth;

  const calendar = [
    ...prevMonthDays,
    ...Array.from({ length: countCurrMonth }, (_, i) => i + 1).map((day) =>
      dt.set({ day }),
    ),
  ];

  const nextMonthDays = getNextMonthDays(calendar.length, dt);
  return [calendar, nextMonthDays].flat();
}

export function getWeekday(index: number): (typeof WEEKDAYS)[number] {
  return WEEKDAYS[index - 1] as (typeof WEEKDAYS)[number];
}

export function fromISO(iso: string): DateTime {
  return DateTime.fromISO(iso);
}

export function debounce(fn: Function, ms: number = 200) {
  let timeoutId: ReturnType<typeof setTimeout>;

  function memoized(query: string) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(fn.bind(fn, query), ms);
  }

  return memoized;
}

const dtUnits: Array<DateTimeUnit> = ["day", "month"];

export function isDateInPast(dt: DateTime) {
  const now = DateTime.local();
  return dt.month < now.month || (dt.hasSame(now, "month") && dt.day < now.day);
}

export function isDateToday(dt: DateTime) {
  const now = DateTime.local();
  return dtUnits.every((unit) => dt.hasSame(now, unit));
}

export function datesAreEqual(dtA: DateTime, dtB: DateTime) {
  const areEqual = [...dtUnits, "year" as const].every((unit) =>
    dtA.hasSame(dtB, unit),
  );
  return areEqual;
}
