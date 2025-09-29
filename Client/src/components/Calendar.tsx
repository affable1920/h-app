import { useState } from "react";
import { DateTime } from "luxon";
import { DAYS_OF_WEEK } from "../types/constants";
import {
  BiSolidSkipNextCircle,
  BiSolidSkipPreviousCircle,
} from "react-icons/bi";
import type { Clinic } from "../types/doc";

function getCalendarInfo(year: number, month: number) {
  const currMonthStartDay = DateTime.local().set({
    year,
    month,
    day: 1,
  }).weekday;

  const daysCurrMonth = DateTime.local().set({ year, month }).daysInMonth;

  const daysPrevMonth = DateTime.local().set({
    year,
    month: month - 1,
  }).daysInMonth;

  const daysFromPrevMonth = daysPrevMonth - currMonthStartDay + 1;

  const prevDays = [];
  for (let i = daysFromPrevMonth; i <= daysPrevMonth; i++) {
    prevDays.push(i);
  }

  return {
    prevDays,
    daysCurrMonth,
  };
}

function createCalendarData(currTime: Record<"month" | "year", number>) {
  const { prevDays, daysCurrMonth } = getCalendarInfo(
    currTime.year,
    currTime.month
  );

  return [
    ...prevDays.map((day) => ({ day, isCurrentMonth: false })),
    ...Array.from({ length: daysCurrMonth }, (_, i) => i + 1).map((day) => ({
      day,
      isCurrentMonth: true,
    })),
  ];
}

const Calendar = ({
  scheduleData,
}: {
  scheduleData?: Record<string, unknown>;
}) => {
  const [currDate, setCurrDate] = useState({
    month: DateTime.local().month,
    year: DateTime.local().year,
  });
  const days = createCalendarData(currDate);

  const clinics = (scheduleData as { clinics: Clinic[] }).clinics.map((cl) => ({
    color: "green",
    ...cl,
  }));

  const handleMonthChange = (direction: "next" | "prev") => {
    setCurrDate((p) => ({
      ...p,
      month: DateTime.local().set({
        month: direction === "next" ? p.month + 1 : p.month - 1,
      }).month,
    }));
  };

  return (
    <>
      <section
        className="bg-white shadow-md shadow-slate-300/60 rounded-lg text-gray-700 flex
     items-center gap-4 justify-center border-2 border-slate-300/20 p-4 pb-6"
      >
        <BiSolidSkipPreviousCircle
          onClick={handleMonthChange.bind(null, "prev")}
        />
        <div className="flex flex-col gap-8">
          <header className="flex justify-center items-center gap-2">
            <h2 className="card-h2 text-lg text-center uppercase opacity-80 font-black">
              {DateTime.local().set({ month: currDate.month }).monthLong}
            </h2>
          </header>

          <div className="grid gap-8 grid-cols-7 justify-items-center">
            {DAYS_OF_WEEK.map((day) => (
              <h2
                key={day}
                className={`opacity-80 font-black underline-offset-4 ${
                  day.toLowerCase() === DateTime.now().weekdayLong.toLowerCase()
                    ? "text-accent-dark underline font-black"
                    : ""
                }`}
              >
                {day.slice(0, 3)}
              </h2>
            ))}
            {days.map(({ day, isCurrentMonth }, index) => (
              <div
                className={`text-center font-bold text-gray-600 
                p-2 py-1 bg-slate-100 rounded-md ${
                  isCurrentMonth
                    ? "cursor-pointer"
                    : "opacity-40 cursor-default"
                } ${
                  day === DateTime.now().day &&
                  currDate.month === DateTime.now().month
                    ? "!bg-accent-light text-white font-black shadow-inner shadow-accent-dark/60"
                    : ""
                }
              `}
                key={index}
              >
                {day}
              </div>
            ))}
          </div>
        </div>
        <BiSolidSkipNextCircle onClick={handleMonthChange.bind(null, "next")} />
      </section>
      <section
        className="bg-white shadow-md shadow-slate-300/60 rounded-lg text-gray-700 flex
     items-center gap-4 border-2 border-slate-300/20 p-4 pb-6"
      >
        <div>
          {clinics.map((clinic) => (
            <div>
              <h2 className="card-h2">{clinic.name}</h2>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default Calendar;
