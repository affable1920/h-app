import { useState, useCallback, type ReactElement } from "react";
import { motion } from "motion/react";
import Button from "./common/Button";
import { MdFlip } from "react-icons/md";

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
      className="card relative"
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
      <motion.article className="backface-hidden absolute inset-0 rotate-y-180 p-4">
        {CardBack}
      </motion.article>

      <Button
        variant="icon"
        needsMotion={true}
        onClick={handleFlip}
        whileTap={{
          scale: [null, 0.5, 1],
          transition: { duration: 0.25 },
        }}
        className={`absolute top-3/5 ${
          isFlipped
            ? "left-full -translate-x-1/2"
            : "right-full translate-x-1/2"
        } `}
      >
        <MdFlip size={16} />
      </Button>
    </motion.article>
  );
};

export default Card;
