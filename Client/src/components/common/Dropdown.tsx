import { AnimatePresence, motion } from "motion/react";

type DropdownProps = {
  show?: boolean;
  options: readonly string[];
  onOptionSelect?: (option: string) => void;
};

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
          className={`max-h-32 overflow-y-scroll ring-2 rounded-lg divide-y
            ring-zinc-400/25 divide-zinc-400/25 shadow-lg shadow-slate-300/20`}
        >
          {options.map((opt) => (
            <motion.li
              key={opt}
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
