import { DateTime } from "luxon";
import { WEEKDAYS } from "./constants";

function getPreviousMonthDays(dt: DateTime<true>): DateTime[] {
  const countPrevMonth = dt.set({ month: dt.month - 1 }).daysInMonth;

  const currMonthStartDay = dt.set({ day: 1 }).weekday;
  const daysCountFromPrevMonth = currMonthStartDay - 1;

  if (daysCountFromPrevMonth === 0) {
    return [];
  }

  const daysFromPrevMonth = countPrevMonth - daysCountFromPrevMonth;
  const prevMonthDays: DateTime[] = [];

  for (let i = daysFromPrevMonth; i <= countPrevMonth; i++) {
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
