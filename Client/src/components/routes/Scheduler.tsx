import React from "react";
import docImage from "../../assets/doctor.jpg";
import useDocStore from "../../stores/doctorsStore";
import { IoInformationCircle } from "react-icons/io5";
import Calendar from "../Calendar";

const Scheduler = React.memo(() => {
  const { currDoctor: doctor } = useDocStore();

  if (!doctor)
    return <div className="card-h2">Doctor onboarding in process...</div>;

  const schedulingKeys = [
    "clinics",
    "nextAvailable",
    "appointments",
    "scheduling",
  ] as const;

  const schedulingData = Object.fromEntries(
    Object.entries(doctor).filter(([key]) =>
      schedulingKeys.includes(key as (typeof schedulingKeys)[number])
    )
  );

  return (
    <article className="font-semibold flex flex-col gap-8">
      {/* header */}
      <header className="flex items-start gap-2">
        <div className="doctor-img-container max-w-40">
          <img className="doctor-img" src={docImage} alt="doc_img" />
        </div>

        <div className="h-full">
          <div className="flex flex-col gap.5">
            <div className="flex items-center">
              <h2 className="card-h2 text-lg">{doctor.name}</h2>
            </div>

            <div className="flex gap-1 items-center">
              <h2 className="card-h2 text-sm">({doctor.credentials})</h2>
              <IoInformationCircle className="text-gray-600 opacity-60" />
            </div>
          </div>
        </div>
      </header>

      <Calendar scheduleData={schedulingData} />
    </article>
  );
});

export default Scheduler;
