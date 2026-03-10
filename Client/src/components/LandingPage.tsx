import { ChevronRight } from "lucide-react";
import { AnimatePresence, motion, stagger } from "motion/react";
import { useState } from "react";

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { delayChildren: stagger(0.1, { startDelay: 0.05 }) },
  },
  exit: {
    opacity: 0,
    transition: { delayChildren: stagger(0.1, { startDelay: 0.05 }) },
  },
};

const items = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0 },
};

const LandingPage = () => {
  const [show, setShow] = useState(false);

  return (
    <motion.div>
      <motion.button
        className="flex items-center cursor-pointer justify-between w-full max-w-50 mx-auto mt-24"
        onClick={setShow.bind(null, (p) => !p)}
      >
        More
        <ChevronRight size={14} rotate={show ? 90 : 0} />
      </motion.button>

      <AnimatePresence>
        {show && (
          <motion.div
            style={{ padding: "16px" }}
            key="container"
            variants={container}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {["Settings", "Profile", "Policy"].map((item) => (
              <motion.div key={item} variants={items}>
                {item}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default LandingPage;
