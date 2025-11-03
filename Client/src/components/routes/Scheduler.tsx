import { memo, useEffect, useState } from "react";
import type { Doctor, Schedule } from "@/types/doctorAPI";

import ClinicsView from "../ClinicsView";
import Calendar from "../calendar/Calendar";
import useScheduleStore from "../../stores/scheduleStore";
import { useLoaderData } from "react-router-dom";

const Scheduler = memo(() => {
  const dr: Doctor = useLoaderData();
  const selectedDate = useScheduleStore((s) => s.selectedDate);
  const setSelectedClinic = useScheduleStore((s) => s.setSelectedClinic);

  const [targetSchedules, setTargetSchedules] = useState<Schedule[]>([]);

  useEffect(() => {
    if (selectedDate) {
      const target = dr?.schedules.filter(
        (s) => s.weekday === selectedDate.weekday
      );

      setTargetSchedules(target ?? []);
      if (target && target[0]?.clinic?.id)
        setSelectedClinic(target[0].clinic.id);
    }
  }, [dr, selectedDate, setSelectedClinic]);

  if (!dr)
    return <div className="card-h2">Doctor onboarding in process ...</div>;

  return (
    <section className="font-semibold flex flex-col items-center pb-12 gap-8">
      <header className="flex self-center px-0.5">
        <div>
          <h2 className="card-h2 text-2xl font-black">Dr. {dr.name}</h2>
        </div>
      </header>

      <section className="flex flex-col gap-8 md:flex-row">
        {targetSchedules && <ClinicsView targetSchedules={targetSchedules} />}
        <Calendar />
      </section>
    </section>
  );
});

export default Scheduler;
