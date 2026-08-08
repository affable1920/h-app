import { memo, useState } from "react";
import { AnimatePresence, motion, type Variant } from "motion/react";
import Button from "./Button";
import { ChevronRight } from "lucide-react";

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

interface SelectFilterProps<T> {
  label: string;
  options: readonly T[];
  onOptionSelect: (option: T) => void;
}

const SelectFilter = memo(function <T>({
  label = "",
  options = [],
  onOptionSelect,
}: SelectFilterProps<T>) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <AnimatePresence mode="wait">
        {isOpen && (
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
            {options.map(function (opt) {
              return (
                <motion.li
                  key={opt as string}
                  variants={optionVariants}
                  className={`hover:bg-layout-raised p-2 py-2.5 transition-colors capitalize 
                cursor-pointer font-semibold italic tracking-wide text-base`}
                  onClick={function () {
                    onOptionSelect(opt);
                  }}
                >
                  {opt as string}
                </motion.li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
      <Button
        color="brand"
        className="w-full"
        border={false}
        onClick={function () {
          setIsOpen(function (p) {
            return !p;
          });
        }}
      >
        {label}
        <motion.i animate={{ rotate: isOpen ? -90 : 0 }}>
          <ChevronRight size={12} strokeWidth={5} />
        </motion.i>
      </Button>
    </div>
  );
});

export default SelectFilter;
