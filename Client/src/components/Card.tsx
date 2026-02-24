import { useState, useCallback, type ReactElement } from "react";
import { motion } from "motion/react";
import { FlipVertical } from "lucide-react";

interface CardProps<T> {
  entity: T;
  CardBack: ReactElement;
  CardFront: ReactElement;
}

const Card = <T,>({ CardFront, CardBack }: CardProps<T>) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const handleFlip = useCallback(() => setIsFlipped((p) => !p), []);

  return (
    <motion.article
      className="rounded-md p-4 pb-3 font-semibold shadow-sm 
    shadow-slate-200/40 border-2 border-slate-300/50 h-full min-h-32 relative"
      animate={{
        rotateY: isFlipped ? 180 : 0,
        transition: { duration: 0.25 },
      }}
      style={{
        transformStyle: "preserve-3d",
      }}
    >
      {/* Card front */}
      <motion.article
        style={{ backfaceVisibility: "hidden", willChange: "contents" }}
        animate={{
          scale: isFlipped ? 0 : 1,
          x: isFlipped ? "1000px" : 0,
          y: isFlipped ? "-100px" : 0,
          opacity: isFlipped ? 0 : 1,
        }}
        transition={{ duration: 0.25 }}
      >
        {CardFront}
      </motion.article>

      {/* Card back */}
      <motion.article className="rotate-y-180 absolute inset-0 p-4 backface-hidden">
        {CardBack}
      </motion.article>

      <motion.button
        onClick={handleFlip}
        style={{
          scale: 0.8,
          opacity: 0.8,
        }}
        whileHover={{ scale: 0.9, opacity: 1 }}
        whileTap={{
          scale: 0.7,
        }}
        className={`cursor-pointer absolute top-3/5 ${
          isFlipped
            ? "left-full -translate-x-1/2"
            : "right-full translate-x-1/2"
        } `}
      >
        <FlipVertical size={14} />
      </motion.button>
    </motion.article>
  );
};

export default Card;
