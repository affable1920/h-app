import React, { useCallback, useEffect, useState } from "react";
import { motion, type Variant } from "motion/react";
import { BiLocationPlus } from "react-icons/bi";
import { BsArrowRight } from "react-icons/bs";
import useDocStore from "../stores/doctorsStore";
import useScheduleStore from "../stores/scheduleStore";
import type { WEEKDAY } from "../utilities/constants";

const variants: Record<string, Variant> = {
  initial: {
    x: 30,
    opacity: 0,
  },

  view: {
    x: 0,
    opacity: 100,
  },
};

const ClinicsView = React.memo(() => {
  const doctor = useDocStore((s) => s.currDoctor);
  const selectedDate = useScheduleStore((s) => s.selectedDate);
  const setSelectedDate = useScheduleStore((s) => s.setSelectedDate);

  const [viewClinics, setViewClinics] = useState(false);
  const [selectedWeekday, setSelectedWeekday] = useState<WEEKDAY | null>(null);

  const availableDays = new Set(
    (doctor?.schedule.map((s) => s.weekday?.toLowerCase()) || []).flat()
  ) as Set<WEEKDAY>;

  function toggleClinicsView() {
    setViewClinics((view) => !view);
  }

  const handleWkdaySelect = useCallback(
    (wkday: WEEKDAY) => {
      if (selectedDate) setSelectedDate(selectedDate);
      setSelectedWeekday((p) => (p === wkday ? null : wkday));
    },
    [selectedDate, setSelectedDate]
  );

  useEffect(() => {
    if (selectedDate) setViewClinics(true);
    setSelectedWeekday(selectedDate?.weekdayLong?.toLowerCase() as WEEKDAY);
  }, [selectedDate]);

  return (
    <section className="box p-6 py-4">
      <div className="flex flex-col gap-8 w-full">
        {doctor?.clinics.map((clinic) => (
          <article className="flex flex-col gap-4" key={clinic.id}>
            <header
              key={clinic.id}
              className="flex justify-between items-center"
            >
              <div className="flex flex-col gap-1">
                <h2 className="card-h2">{clinic.name}</h2>
                <p
                  className={`flex items-center gap-2 text-sm underline underline-offset-2`}
                >
                  {clinic.address}
                  <BiLocationPlus />
                </p>
              </div>
              <motion.button
                animate={{
                  rotate: viewClinics ? 90 : 0,
                  transition: { duration: 0.15 },
                }}
              >
                <BsArrowRight
                  className="cursor-pointer"
                  onClick={toggleClinicsView}
                />
              </motion.button>
            </header>
            <motion.div
              variants={variants}
              transition={{
                duration: 0.15,
              }}
              animate={viewClinics ? "view" : "initial"}
              className="flex flex-wrap items-center text-sm gap-2"
            >
              {Array.from(availableDays)?.map((day, i) => {
                return (
                  <motion.button
                    onClick={handleWkdaySelect.bind(null, day)}
                    className={`badge p-.5 capitalize font-bold
                          ${selectedWeekday === day && "badge-selected"} 
                      `}
                    key={day}
                    transition={{ delay: i * 0.03 }}
                  >
                    {day.slice(0, 3)}
                  </motion.button>
                );
              })}
            </motion.div>
          </article>
        ))}
      </div>
    </section>
  );
});

export default ClinicsView;
