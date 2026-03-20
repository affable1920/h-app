import { AnimatePresence, motion, stagger, type Variant } from "motion/react";

type DropdownProps = {
  show?: boolean;
  options: readonly string[];
  onOptionSelect?: (option: string) => void;
};

const dropDownVariants: Record<string, Variant> = {
  hidden: {
    opacity: 0,
    height: 0,
  },

  visible: {
    opacity: 1,
    height: "auto",
    marginBottom: "8px",
    transition: {
      duration: 0.2,
      ease: "easeOut",
      delayChildren: stagger(0.025),
    },
  },

  exit: {
    marginBottom: 0,
    opacity: 0,
    height: 0,
  },
};

const optionVariants: Record<string, Variant> = {
  hidden: {
    filter: "blur(4px)",
  },
  visible: {
    filter: "blur(0)",
  },
  exit: {
    filter: "blur(4px)",
  },
};

const Dropdown = ({
  show = false,
  options = [],
  onOptionSelect,
}: DropdownProps) => {
  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.ul
          layout
          key="dropdown"
          variants={dropDownVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          style={{ scrollbarWidth: "none", overflowX: "hidden" }}
          className={`max-h-32 overflow-y-scroll ring-2 rounded-lg divide-y
            ring-zinc-400/25 divide-zinc-400/25 shadow-lg shadow-slate-300/20`}
        >
          {options.map((opt) => (
            <motion.li
              key={opt}
              variants={optionVariants}
              className={`hover:bg-zinc-50 p-2 py-2.5 transition-colors capitalize 
                cursor-pointer font-semibold italic tracking-wide`}
              onClick={() => onOptionSelect?.(opt)}
            >
              {opt as string}
            </motion.li>
          ))}
        </motion.ul>
      )}
    </AnimatePresence>
  );
};

export default Dropdown;
