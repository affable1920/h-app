import React from "react";
import { motion } from "motion/react";
import { MdFlip } from "react-icons/md";

import type { Doc } from "../types/doc";
import { useCallback, useState } from "react";

import DrCardEssentials from "./DrCardEssentials";
import DrCardSecondaryInfo from "./DrCardSecondaryInfo";

interface DoctorCardProps {
  doctor: Doc;
}

const DoctorCard = React.memo(({ doctor }: DoctorCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const handleFlip = useCallback(() => setIsFlipped((p) => !p), []);

  if (!doctor)
    return <h1 className="card-h2">Doctor onboarding in process !</h1>;

  return (
    <motion.article
      className="card relative"
      animate={{
        rotateY: isFlipped ? 180 : 0,
        transition: { duration: 0.29 },
      }}
      style={{
        transformStyle: "preserve-3d",
      }}
    >
      {/* front side */}
      <motion.article
        style={{ backfaceVisibility: "hidden" }}
        animate={{
          scale: isFlipped ? 0 : 1,
          x: isFlipped ? "1000px" : 0,
          y: isFlipped ? "-100px" : 0,
          opacity: isFlipped ? 0 : 1,
        }}
        transition={{ duration: 0.25 }}
      >
        <DrCardEssentials doctor={doctor} />
        <DrCardSecondaryInfo doctor={doctor} />
      </motion.article>

      {/* back side */}
      <motion.article className="backface-hidden absolute inset-0 rotate-y-180 p-4"></motion.article>

      <motion.button
        onClick={handleFlip}
        whileHover={{ scale: 0.9, opacity: 0.75 }}
        whileInView={{ scale: 0.75, opacity: 0.5 }}
        whileTap={{
          opacity: 1,
          scale: [null, 0.5, 1],
          transition: { duration: 0.25 },
        }}
        className={`fixed top-3/5 ${
          isFlipped
            ? "left-full -translate-x-1/2"
            : "right-full translate-x-1/2"
        } `}
      >
        <MdFlip size={20} />
      </motion.button>
    </motion.article>
  );
});

export default DoctorCard;
