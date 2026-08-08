import { useLocation } from "react-router-dom";
import Code from "../../../components/ui/Code";
import Calendar from "@components/Calendar";
import Spinner from "../../../components/ui/Spinner";
import { useGetById } from "@/hooks/use-doctors";
import { ClinicViewVariants } from "@/utils/motion-variants";
import { motion } from "motion/react";
import { ScheduleItem } from "./ScheduleItem";
import Button from "@/components/ui/Button";

function SchedulesView() {
  const path = useLocation().pathname;
  const id = path.split("/").filter(Boolean).at(-2);

  const {
    data: doctor,
    isPending,
    isError,
    refetch,
  } = useGetById(id as string);

  if (isPending) {
    return <Spinner />;
  }

  if (isError || !doctor) {
    return (
      <div>
        An <Code>UNEXPECTED ERROR</Code> occurred.
        <br />
        Please try after sometime.{" "}
        <Button
          onClick={function () {
            refetch();
          }}
        />
      </div>
    );
  }

  return (
    <section>
      <header className="flex justify-center">
        <h2 className="text-lg">Dr. {doctor.name}</h2>
      </header>

      {!!doctor.schedules.length ? (
        <section className="flex flex-col md:flex-row gap-12 mt-10">
          <motion.section
            key={`${doctor.id}-schedule-view`}
            viewport={{ once: true }}
            variants={ClinicViewVariants.containerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-1 flex-col gap-10 shadow-md rounded-xl border-2 border-border p-6 bg-layout
           shadow-black/20"
          >
            {doctor.schedules.map(function (schedule) {
              return (
                <ScheduleItem
                  doctor={doctor}
                  key={schedule.id}
                  schedule={schedule}
                />
              );
            })}
          </motion.section>
          <Calendar schedules={doctor.schedules} />
        </section>
      ) : (
        <div
          className="text-center text-md text-brand-hover bg-white flex justify-center 
          items-center p-2 font-bold rounded-lg w-full max-w-md mx-auto mt-6"
        >
          The Doctor has no active schedules yet .. !
        </div>
      )}
    </section>
  );
}

export default SchedulesView;
