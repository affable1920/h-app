/* eslint-disable @typescript-eslint/no-unused-vars */
import { memo, useState } from "react";
import { useLocation } from "react-router-dom";

import { DateTime } from "luxon";
import Calendar from "@components/Calendar";
import ClinicsView from "@components/ClinicsView";
import Badge from "@components/common/Badge";
import Button from "@components/common/Button";
import { ArrowRight } from "lucide-react";
import { useDoctor } from "@/hooks/useDoctorsQuery";
import Spinner from "../Spinner";

const Scheduler = memo(() => {
  const id = useLocation().pathname.split("/").at(2);
  const { data: dr, isPending, isError } = useDoctor(id as string);

  const [showClinicsView, setShowClinicsView] = useState(false);

  if (isPending) return <Spinner />;

  if (isError)
    return (
      <div className="card-h2">
        Hold your breathe. Doctor onboarding in process ...
      </div>
    );

  const { name, schedules = [] } = dr;

  function toggleView() {
    setShowClinicsView((p) => !p);
  }

  return (
    <section className="font-semibold flex flex-col pb-12 gap-8 mt-4">
      <header className="flex items-center gap-4">
        <h2 className="card-h2 text-2xl font-black">Dr. {name} Tanner</h2>
        <Button
          variant="icon"
          needsMotion={true}
          onClick={toggleView}
          animate={{ rotate: showClinicsView ? 90 : 0 }}
        >
          <ArrowRight />
        </Button>
      </header>

      <section className="flex flex-col gap-2">
        <ClinicsView
          doctor={dr}
          schedules={schedules}
          onShow={setShowClinicsView}
          showClinicsView={showClinicsView}
        />
      </section>

      <section className="flex flex-col gap-8 md:flex-row w-full">
        <Calendar schedules={schedules} />
      </section>
    </section>
  );
});

export default Scheduler;
