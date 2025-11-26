/* eslint-disable @typescript-eslint/no-unused-vars */
import { memo, useState } from "react";
import { useLoaderData } from "react-router-dom";

import ClinicsView from "../ClinicsView";
import Calendar from "../calendar/Calendar";
import type { Doctor } from "@/types/doctorAPI";
import Badge from "../common/Badge";
import { DateTime } from "luxon";
import Button from "../common/Button";
import { ArrowRight } from "lucide-react";

const Scheduler = memo(() => {
  const dr = useLoaderData<Doctor>();
  const [showClinicsView, setShowClinicsView] = useState(false);

  const {
    name,
    next_available,
    schedules = [],
    currently_available = false,
  } = dr;

  const nxtAvailable = DateTime.fromISO(next_available!);

  const info = currently_available
    ? "Available right now !"
    : `${nxtAvailable.toFormat("dd LLL yyyy")}`;

  if (!dr)
    return (
      <div className="card-h2">
        Hold your breathe. Doctor onboarding in process ...
        <Badge as="link" content="View similar doctors !" />
      </div>
    );

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
        <Badge full={false} content={info} />
        <ClinicsView
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
