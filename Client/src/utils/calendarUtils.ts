import { DateTime } from "luxon";
import { DAYS_OF_WEEK } from "./constants";

function getPreviousMonthDays(date: DateTime): DateTime[] {
  const countPrevMonth = DateTime.local().set({
    year: date.year,
    month: date.month - 1,
  }).daysInMonth;

  const currMonthStartDay = date.set({ day: 1 }).weekday;
  const daysFromPrevMonth = countPrevMonth - currMonthStartDay + 1;

  const prevMonthDays: DateTime[] = [];

  for (let i = daysFromPrevMonth; i <= countPrevMonth; i++) {
    prevMonthDays.push(DateTime.local().set({ month: date.month - 1, day: i }));
  }

  return prevMonthDays;
}

function getNextMonthDays(
  currLength: number,
  currMonthIndex: number
): DateTime[] {
  const daysFromNextMonth = Math.abs((currLength % 7) - 7);

  return Array.from({ length: daysFromNextMonth }, (_, i) =>
    DateTime.local().set({ month: currMonthIndex + 1, day: i + 1 })
  );
}

export function createCalendarData(date: DateTime): DateTime[] {
  const prevMonthDays = getPreviousMonthDays(date);
  const countCurrMonth = date.daysInMonth;

  const calendar = [
    ...prevMonthDays,
    ...Array.from({ length: countCurrMonth ?? 0 }, (_, i) => i + 1).map((day) =>
      date.set({ day })
    ),
  ];

  const nextMonthDays = getNextMonthDays(calendar.length, date.month);
  return [calendar, nextMonthDays].flat();
}

export function getWeekdaysWithIndexes() {
  return DAYS_OF_WEEK.map((day, index) => ({ index, day: day }));
}

export function getWeekData(daysAvailable: number[]) {
  const availableDays = getWeekdaysWithIndexes()
    .filter(({ day }) => daysAvailable.includes(day as number))
    .map(({ index }) => index);

  const daysToDisable = getWeekdaysWithIndexes()
    .filter(({ day }) => !daysAvailable.includes(day as number))
    .map(({ index }) => index);

  return {
    availableDays,
    daysToDisable,
  };
}

export function getWeekday(index: number): number {
  return DAYS_OF_WEEK[index] as number;
}
