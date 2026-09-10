import { useState } from "react";
import { AnimatePresence, motion, type Variant } from "motion/react";
import Button from "./Button";
import { ChevronRight, MousePointer } from "lucide-react";

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
  canSelectAll?: boolean;
  isOpen?: boolean;
  onOptionSelect: (option: T | "all") => void;
  onOpenChange?: (open: boolean) => void;
  selected?: T;
}

function defaultGetLabel<T>(option: T): string {
  if (option && typeof option === "object" && "label" in option) {
    return String(option.label);
  } else {
    return String(option);
  }
}

function defaultGetKey<T>(option: T): string | number {
  if (option && typeof option === "object" && "value" in option) {
    return (option as { value: string | number }).value;
  } else {
    return String(option);
  }
}

const SelectFilter = function <T>({
  label = "",
  options = [],
  onOptionSelect,
  canSelectAll = false,
  isOpen: controlledIsOpen,
  onOpenChange,
  selected,
}: SelectFilterProps<T>) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  const isControlled = controlledIsOpen !== undefined;
  const open = controlledIsOpen ?? internalIsOpen;

  function setIsOpen(next: boolean | ((prev: boolean) => boolean)) {
    const resolved = typeof next === "function" ? next(open) : next;
    if (!isControlled) {
      setInternalIsOpen(resolved);
    }

    onOpenChange?.(resolved);
  }

  return (
    <div>
      <AnimatePresence mode="wait">
        {open && (
          <motion.div
            key="dropdown"
            initial="initial"
            animate="animate"
            exit="exit"
            layout
            variants={dropDownVariants}
            className={`flex flex-col gap-2 shadow-lg shadow-layout-raised rounded-lg overflow-hidden`}
          >
            <motion.ul
              className="max-h-50 overflow-y-scroll rounded-lg divide-y-2 divide-border-strong"
              style={{
                scrollbarWidth: "none",
                overflowX: "hidden",
                border: "2px solid var(--color-border-strong)",
              }}
            >
              {options.map(function (opt) {
                return (
                  <motion.li key={defaultGetKey(opt)} variants={optionVariants}>
                    <button
                      type="button"
                      onClick={function () {
                        onOptionSelect(opt);
                      }}
                      className={`appearance-none hover:bg-layout-raised p-3 py-2.5 
                        transition-colors capitalize cursor-pointer font-semibold italic tracking-wide 
                        text-base w-full text-left ${
                          selected !== undefined &&
                          defaultGetKey(opt) === selected
                            ? "bg-white"
                            : "bg-transparent"
                        }`}
                    >
                      {defaultGetLabel(opt)}
                    </button>
                  </motion.li>
                );
              })}
            </motion.ul>
            {canSelectAll && (
              <Button
                style={{
                  scale: 0.8,
                }}
                needsMotion={true}
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{
                  x: 15,
                  opacity: 0,
                }}
                className="w-fit self-end"
                color="indicator"
                border={false}
                onClick={function () {
                  onOptionSelect("all");
                }}
              >
                <MousePointer /> All
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <Button
        color="brand"
        className="w-full"
        border={false}
        aria-expanded={open}
        onClick={function () {
          setIsOpen(!open);
        }}
      >
        {label}
        <motion.i animate={{ rotate: open ? -90 : 0 }}>
          <ChevronRight size={12} strokeWidth={5} />
        </motion.i>
      </Button>
    </div>
  );
};

export default SelectFilter;
