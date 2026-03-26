import { useState } from "react";
import { useLocation } from "react-router-dom";

import Code from "../ui/Code";
import ClinicsView from "@components/ClinicsView";
import Calendar from "@components/Calendar";
import Spinner from "../Spinner";

import { useGetById } from "@/hooks/doctors";

function Scheduler() {
  const id = useLocation().pathname.split("/").at(2);
  const [showClinicsView, setShowClinicsView] = useState(false);
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
    <section className="space-y-8">
      <header className="flex gap-4 justify-center">
        <h2 className="text-lg font-black">Dr. {doctor.name}</h2>
      </header>

      <section
        style={{
          justifyContent: showClinicsView ? "flex-end" : "flex-start",
        }}
        className="flex flex-col md:flex-row gap-12"
      >
        <ClinicsView
          doctor={doctor}
          onShow={setShowClinicsView}
          showClinicsView={showClinicsView}
        />

        <Calendar shouldMove={showClinicsView} schedules={doctor.schedules} />
      </section>
    </section>
  );
}

export default Scheduler;
