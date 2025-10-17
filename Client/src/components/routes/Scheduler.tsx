import { memo, useEffect, useState } from "react";
import type { Schedule } from "../../types/Doctor";

import ClinicsView from "../ClinicsView";
import Calendar from "../Calendar/Calendar";
import useDoctorsStore from "../../stores/doctorsStore";
import useScheduleStore from "../../stores/scheduleStore";

const Scheduler = memo(() => {
  const doctor = useDoctorsStore((s) => s.currDoctor);
  const selectedDate = useScheduleStore((s) => s.selectedDate);
  const setSelectedClinic = useScheduleStore((s) => s.setSelectedClinic);

  const [targetSchedules, setTargetSchedules] = useState<Schedule[]>([]);

  useEffect(() => {
    if (selectedDate) {
      const target = doctor?.schedules.filter(
        (s) =>
          s.weekday?.toLowerCase() === selectedDate.weekdayLong?.toLowerCase()
      );

      setTargetSchedules(target ?? []);
      if (target && target[0]?.clinic?.id)
        setSelectedClinic(target[0].clinic.id);
    }
  }, [doctor, selectedDate, setSelectedClinic]);

  if (!doctor)
    return <div className="card-h2">Doctor onboarding in process ...</div>;

  return (
    <section className="font-semibold flex flex-col items-center pb-12 gap-8">
      <header className="flex self-center px-0.5">
        <div>
          <h2 className="card-h2 text-2xl font-black">Dr. {doctor.name}</h2>
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
