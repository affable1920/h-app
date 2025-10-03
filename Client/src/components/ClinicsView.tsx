import React, { useEffect, useState } from "react";
import { motion, type Variant } from "motion/react";
import { BiLocationPlus } from "react-icons/bi";
import { BsArrowRight } from "react-icons/bs";
import useDocStore from "../stores/doctorsStore";
import useScheduleStore from "../stores/scheduleStore";

const ClinicsView = React.memo(() => {
  const clinics = useDocStore((s) => s.currDoctor?.clinics);
  const selectedDate = useScheduleStore((s) => s.selectedDate);
  // const setSelectedDate = useScheduleStore((s) => s.setSelectedDate);

  const [viewClinics, setViewClinics] = useState(false);

  const availableDays = new Set(
    clinics?.map((cl) => Object.keys({ ...cl.schedule })).flat()
  );

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

  function toggleClinicsView() {
    setViewClinics((p) => !p);
  }

  useEffect(() => {
    if (selectedDate) setViewClinics(true);
  }, [selectedDate]);

  // const [selectedWeekday, setSelectedWeekday] = useState<string>("");

  // function handleWeekdaySelect(wkday: string) {
  //   if (selectedDate) setSelectedDate(selectedDate);
  //   setSelectedWeekday(wkday);
  // }

  return (
    <section className="box p-6 py-4">
      <div className="flex flex-col gap-8 w-full">
        {clinics?.map((clinic) => (
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
              {Array.from(availableDays)?.map((day, i) => (
                <motion.button
                  // onClick={handleWeekdaySelect.bind(null, day)}
                  className={` badge p-.5 capitalize font-bold ${
                    selectedDate?.weekdayLong?.toLowerCase() ===
                      day.toLowerCase() && "badge-selected"
                  } 
                  `}
                  // ${selectedWeekday === day && "badge-selected"}
                  transition={{ delay: i * 0.03 }}
                  key={day}
                >
                  {day.slice(0, 3)}
                </motion.button>
              ))}
            </motion.div>
          </article>
        ))}
      </div>
    </section>
  );
});

export default ClinicsView;
