import { memo, useCallback, useState } from "react";
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
    <section className="font-semibold flex flex-col pb-12 gap-8 mt-4">
      <header className="flex items-center gap-4">
        <h2 className="card-h2 text-2xl font-black">Dr. {data.fullname}</h2>
        <motion.button
          onClick={() => setShowClinicsView((p) => !p)}
          animate={{ rotate: showClinicsView ? 90 : 0 }}
        >
          <ArrowRight size={14} />
        </motion.button>
      </header>

      <ClinicsView
        doctor={data}
        onShow={setShowClinicsView}
        showClinicsView={showClinicsView}
      />

      <section className="flex flex-col gap-8 md:flex-row w-full">
        <Calendar schedules={data.schedules} />
      </section>
    </section>
  );
});

export default Scheduler;
