import { AnimatePresence, motion } from "motion/react";

type DropdownProps = {
  show?: boolean;
  options: readonly string[];
  onOptionSelect?: (option: string) => void;
};

const optionListClasses = `flex flex-col font-bold text-secondary-dark bg-transparent 
rounded-md border-2 max-h-48 overflow-y-scroll border-secondary-lightest/50`;

const optionClasses = `hover:bg-slate-50 cursor-pointer capitalize border 
transition-colors p-2 py-3 border-inherit`;

const Dropdown = ({ show = false, options, onOptionSelect }: DropdownProps) => {
  return (
    <AnimatePresence mode="wait">
      {/* Elements using animate presence must not be mounted */}
      {show && (
        <motion.ul
          key="dropdown"
          initial={{ opacity: 0, height: 0 }}
          animate={{
            opacity: 1,
            height: "auto",
            transition: { duration: 0.2, ease: "easeOut" },
          }}
          exit={{ opacity: 0, height: 0 }}
          style={{ scrollbarWidth: "none" }}
          className={optionListClasses}
        >
          {options.map((opt) => (
            <motion.li
              key={opt}
              className={optionClasses}
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
