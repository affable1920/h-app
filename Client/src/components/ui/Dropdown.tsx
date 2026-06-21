import { AnimatePresence, motion, stagger, type Variant } from "motion/react";
import { memo } from "react";

type DropdownProps = {
  show?: boolean;
  options: readonly string[];
  onOptionSelect?: (option: string) => void;
};

const dropDownVariants: Record<string, Variant> = {
  initial: {
    height: 0,
  },

  animate: {
    height: "auto",
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
    marginBottom: "8px",
    border: "2px solid var(--color-border-strong)",
  },

  exit: {
    marginBottom: 0,
    height: 0,
    border: "0",
  },
};

const optionVariants: Record<string, Variant> = {
  initial: {
    y: 4,
  },
  animate: {
    y: 0,
  },
  exit: {
    y: 4,
  },
};

const Dropdown = memo(function ({
  show,
  options = [],
  onOptionSelect,
}: DropdownProps) {
  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.ul
          key="dropdown"
          variants={dropDownVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          layout
          style={{ scrollbarWidth: "none", overflowX: "hidden" }}
          className={`max-h-50 overflow-y-scroll rounded-lg divide-y
             border-border-vivid divide-border-vivid shadow-lg shadow-layout-raised`}
        >
          {options.map((opt) => (
            <motion.li
              key={opt}
              variants={optionVariants}
              className={`hover:bg-layout-raised p-2 py-2.5 transition-colors capitalize 
                cursor-pointer font-semibold italic tracking-wide text-base`}
              onClick={function () {
                onOptionSelect?.(opt);
              }}
            >
              {opt as string}
            </motion.li>
          ))}
        </motion.ul>
      )}
    </AnimatePresence>
  );
});

export default Dropdown;
