import React, { useState } from "react";
import docImage from "../../assets/doctor.jpg";
import useDocStore from "../../stores/doctorsStore";
import { IoInformationCircle, IoInformationCircleSharp } from "react-icons/io5";
import Calendar from "../Calendar/Calendar";
import ClinicsView from "../ClinicsView";
import { motion, type Variant } from "motion/react";
// import DoctorService from "../../services/DoctorService";

const Scheduler = React.memo(() => {
  const doctor = useDocStore((s) => s.currDoctor);

  // const service = doctor?.id ? new DoctorService(doctor.id) : null;
  // const doctorInfo = service?.getDoctorInfo(doctor?.status);

  const [showInfo, setShowInfo] = useState(false);

  if (!doctor)
    return <div className="card-h2">Doctor onboarding in process ...</div>;

  const variants: Record<string, Variant> = {
    hidden: {
      x: 100,
      opacity: 0,
    },
    visible: {
      x: 0,
      opacity: 1,
    },
  };

  return (
    <article className="font-semibold flex flex-col gap-8">
      <header className="flex gap-2">
        <div className="doctor-img-container max-w-40">
          <img className="doctor-img" src={docImage} alt="doc_img" />
        </div>

        <div className="flex flex-col justify-between">
          <div className="flex flex-col items-end gap-.5">
            <div>
              <h2 className="card-h2 text-lg font-black">{doctor.name}</h2>
            </div>

            <div className="flex gap-1 items-center">
              <h2 className="card-h2 text-xs italic">({doctor.credentials})</h2>
              <IoInformationCircle className="text-gray-600 opacity-60" />
            </div>
          </div>

          <div>
            <h2 className="card-h2 capitalize text-sm italic">
              {doctor.status}
            </h2>
          </div>
        </div>
      </header>

      <section className="flex flex-col gap-8 md:flex-row">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-end overflow-hidden italic font-bold text-sm gap-2 text-sky-800 opacity-75">
            <motion.p
              variants={variants}
              transition={{ duration: 0.1 }}
              animate={showInfo ? "visible" : "hidden"}
            >
              Select any day that fits your schedule
            </motion.p>
            <IoInformationCircleSharp
              className="cursor-pointer z-1"
              onClick={() => setShowInfo(!showInfo)}
            />
          </div>
          <Calendar />
        </div>
        <ClinicsView />
      </section>
    </article>
  );
});

export default Scheduler;
