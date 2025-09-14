import { memo } from "react";
import { motion } from "motion/react";
import type { Clinic } from "../types/doc";
import { HiLocationMarker } from "react-icons/hi";

const CardDropdown = memo(({ clinics }: { clinics: Clinic[] }) => {
  return (
    <motion.div className="flex items-center gap-4">
      <div
        className="p-1 px-2 bg-sky-100/20 border border-sky-300/50 rounded-md font-black 
      text-accent-dark leading-tight"
      >
        <h2>Docs practice locations</h2>
      </div>
      <div className="flex justify-between grow">
        {clinics.map((clinic) => (
          <div className="text-center items-center" key={clinic.contact}>
            <button className="btn flx btn">
              <HiLocationMarker className="cursor-pointer" />
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
});

export default CardDropdown;
