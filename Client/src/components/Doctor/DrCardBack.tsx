import type { Doctor } from "../../types/Doctor";
import { motion } from "motion/react";
import { IoLocation } from "react-icons/io5";
import Button from "../Button";

const DrCardBack = ({ doctor }: { doctor: Doctor }) => {
  return (
    <div className="flex flex-col h-1/2">
      <h2 className="card-h2 grow">{doctor.name}</h2>

      <section className="">
        {doctor.office && <div>{doctor.office?.name}</div>}

        <div className="italic font-semibold text-sm flex flex-wrap justify-end gap-4 overflow-hidden relative">
          <h2 className="card-h2">{doctor.office?.name}</h2>
          {doctor.clinics.map((clinic, i) => (
            <motion.div
              className="flex items-center gap-1 font-semibold overflow-hidden z-10"
              key={i}
            >
              <motion.h2 className="card-h2 hover:underline text-sky-900">
                {clinic.name}
              </motion.h2>
              <Button className="z-10">
                <IoLocation />
              </Button>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DrCardBack;
