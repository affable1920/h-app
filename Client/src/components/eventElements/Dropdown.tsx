import { AnimatePresence, motion } from "motion/react";

type DropdownProps = {
  show?: boolean;
  label?: string;
  isSearchable?: boolean;
  options: readonly string[];
  onOptionSelect?: (option: string) => void;
};

const optionListClasses = `flex flex-col font-semibold text-secondary-dark bg-white 
rounded-md border-2 border-slate-200/40 max-h-48 overflow-y-scroll`;

const optionClasses = `hover:bg-slate-50 cursor-pointer capitalize border-[1px] 
border-slate-300/50 transition-colors p-2 py-3`;

const Dropdown = ({ show = false, options, onOptionSelect }: DropdownProps) => {
  return (
    <AnimatePresence mode="wait">
      {/* Elements using animate presence must not be mounted */}
      {show && (
        <motion.ul
          key="dropdown"
          layout
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
          {options.map((option) => (
            <li
              key={option}
              className={optionClasses}
              onClick={() => onOptionSelect?.(option)}
            >
              {option}
            </li>
          ))}
        </motion.ul>
      )}
    </AnimatePresence>
  );
};

export default Dropdown;
