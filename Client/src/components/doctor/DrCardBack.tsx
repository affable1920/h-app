import React from "react";
import type { DoctorSummary } from "../../types/doctorAPI";

const DrCardBack = React.memo(
  ({ doctor }: { doctor: DoctorSummary }) => {
    return (
      <div className="flex flex-col h-1/2">
        <h2 className="card-h2 grow">{doctor.name}</h2>

        <section className="">
          <div className="italic font-semibold text-sm flex flex-wrap justify-end gap-4 overflow-hidden relative"></div>
        </section>
      </div>
    );
  },
  (prev, next) => prev.doctor.id === next.doctor.id
);

export default DrCardBack;
