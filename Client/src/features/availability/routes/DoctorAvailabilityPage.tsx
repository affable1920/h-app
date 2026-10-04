import { useLoaderData } from "react-router-dom";
import { Calendar } from "@components/lib/Calendar";
import { ClinicViewVariants } from "@/utils/motion-variants";
import { motion } from "motion/react";
import { AvailabilityScheduleGroup } from "../components/DrAvailabilityScheduleGroup";
import type { GetDoctorResponse } from "@/types/doctor-api";
import { useCallback, useState } from "react";
import { DateTime } from "luxon";

function DrAvailabilityPage() {
  const doctor = useLoaderData<GetDoctorResponse>();
  const [viewMonth, setViewMonth] = useState(DateTime.local());

  const handleForwardSwitch = useCallback(
    function () {
      setViewMonth((current) => current.plus({ months: 1 }));
    },
    [setViewMonth],
  );

  const handleBackSwitch = useCallback(function () {
    setViewMonth((c) => c.minus({ months: 1 }));
  }, []);

  if (!doctor) {
    return (
      <p className="text-center mx-auto text-md font-semibold">
        Could not load the requested doctor ..{" "}
      </p>
    );
  }

  return (
    <section>
      <header className="flex justify-center">
        <h2 className="text-lg">
          Dr. {doctor.name} ({doctor.credentials})
        </h2>
      </header>

      {!doctor.schedules?.length && (
        <div
          className="text-center text-md text-brand-hover bg-white flex justify-center 
          items-center p-2 font-bold rounded-lg w-full max-w-md mx-auto mt-6"
        >
          The Doctor has no active schedules yet .. !
        </div>
      )}

      <section className="flex flex-col md:flex-row gap-12 mt-10">
        <motion.section
          key={`${doctor.id}-schedule-view`}
          viewport={{ once: true }}
          variants={ClinicViewVariants.containerVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="flex flex-1 flex-col gap-10 shadow-md rounded-xl border border-border-strong 
            p-6 bg-layout shadow-black/25"
        >
          {(doctor.schedules ?? []).map(function (schedule) {
            return (
              <AvailabilityScheduleGroup
                doctor={doctor}
                key={schedule.id}
                schedule={schedule}
              />
            );
          })}
        </motion.section>

        <Calendar>
          <Calendar.Header
            viewMonth={viewMonth}
            onNext={handleForwardSwitch}
            onPrevious={handleBackSwitch}
          />
          <Calendar.Content viewMonth={viewMonth} />
          <Calendar.Legend />
        </Calendar>
      </section>
    </section>
  );
}

export default DrAvailabilityPage;
