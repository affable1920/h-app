import { memo, useState } from "react";
import { motion } from "motion/react";
import { useLocation } from "react-router-dom";

import Calendar from "@components/Calendar";
import ClinicsView from "@components/ClinicsView";
import { ArrowRight } from "lucide-react";
import Spinner from "../Spinner";
import { useGetById } from "@/hooks/doctors";

const Scheduler = memo(() => {
  const id = useLocation().pathname.split("/").at(2);
  const { data, isPending, isError } = useGetById(id as string);

  const [showClinicsView, setShowClinicsView] = useState(false);

  if (isPending) {
    return <Spinner />;
  }

  if (isError) {
    return (
      <div className="card-h2">
        Hold your breathe. Doctor onboarding in process ...
      </div>
    );
  }

  return (
    <section className="space-y-12">
      <header className="flex flex-col gap-8">
        <div className="flex items-center gap-4 self-center">
          <h2 className="card-h2 text-lg font-black">Dr. {data.fullname}</h2>
          <motion.button
            className="cursor-pointer"
            onClick={() => setShowClinicsView((p) => !p)}
            animate={{ rotate: showClinicsView ? 90 : 0 }}
          >
            <ArrowRight size={14} />
          </motion.button>
        </div>

        <ClinicsView
          doctor={data}
          onShow={setShowClinicsView}
          showClinicsView={showClinicsView}
        />
      </header>

      <Calendar schedules={data.schedules} />
    </section>
  );
});

export default Scheduler;
