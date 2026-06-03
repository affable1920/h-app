import { useLocation } from "react-router-dom";
import Code from "../../../components/ui/Code";
import Calendar from "@components/Calendar";
import Spinner from "../../../components/ui/Spinner";
import { useGetById } from "@/hooks/use-doctors";
import { ClinicViewVariants } from "@/utils/motion-variants";
import { motion } from "motion/react";
import { ScheduleItem } from "./ScheduleItem";
import Divider from "../../../components/ui/Divider";

function Scheduler() {
  const path = useLocation().pathname;
  const id = path.split("/").filter(Boolean).at(-2);

  const { data: doctor, isPending, isError } = useGetById(id as string);

  if (isPending) {
    return <Spinner />;
  }

  if (isError) {
    return (
      <div className="card-h2">
        Hold your breathe. <Code>Doctor</Code> onboarding in process ...
      </div>
    );
  }

  return (
    <section>
      <header className="flex justify-center mb-10">
        <h2 className="text-lg">Dr. {doctor.name}</h2>
      </header>

      <section className="flex flex-col md:flex-row gap-12">
        <motion.section
          key={`${doctor.id}-schedule-view`}
          variants={ClinicViewVariants.containerVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="flex flex-1 flex-col gap-10 shadow-md rounded-xl border-2 border-border p-6 bg-layout"
        >
          {doctor.schedules.map((schedule) => (
            <ScheduleItem schedule={schedule} />
          ))}
        </motion.section>

        <Calendar schedules={doctor.schedules} />
      </section>
    </section>
  );
}

export default Scheduler;
