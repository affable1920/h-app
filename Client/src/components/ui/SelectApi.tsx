import { forwardRef, useRef, useState, type KeyboardEvent } from "react";
import { ChevronRight } from "lucide-react";
import { AnimatePresence, motion, type Variant } from "motion/react";
import Button from "../lib/button/Button";
import Badge from "./Badge";

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
    marginBlock: "8px",
  },

  exit: {
    marginBlock: 0,
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

type OptionValue = string | number;

type Option<T extends OptionValue> = {
  value: T;
  label: string;
  disabled?: boolean;
};

export interface SingleSelectProps<T extends OptionValue> {
  label: string;
  options: Array<Option<T>>;
  selected: T | null;
  onValueChange: (next: T | null) => void;
  clearable?: boolean;
}

export const Select = forwardRef<
  HTMLUListElement,
  SingleSelectProps<OptionValue>
>(function ({ label, options = [], onValueChange, selected }, ref) {
  const selectedOption = options.find((o) => o.value === selected);

  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  function escape(ev: KeyboardEvent) {
    if (ev.key.toLowerCase() == "escape") {
      if (!open) {
        return;
      }

      ev.preventDefault();
      ev.stopPropagation();

      triggerRef.current?.focus();
      setOpen(false);
    }
  }

  return (
    <div className="space-y-2" onKeyDown={escape}>
      <AnimatePresence mode="wait">
        {selected !== null && !open && (
          <motion.div className="px-1">
            <Badge
              aria-label={`remove ${selectedOption?.label} from the ${label}.`}
              selected={true}
              as="button"
              onClick={function () {
                onValueChange(null);
                triggerRef.current?.focus();
              }}
            >
              {selectedOption?.label}
            </Badge>
          </motion.div>
        )}
        {open && (
          <motion.div
            layout
            variants={dropDownVariants}
            className="space-y-2"
            key="dropdown"
            initial="initial"
            animate="animate"
            exit="exit"
            style={{
              overflow: "hidden",
            }}
          >
            <motion.ul
              ref={ref}
              className="appearance-none max-h-50 overflow-y-scroll rounded-lg divide-y-2 divide-border-strong"
              style={{
                scrollbarWidth: "none",
                overflowX: "hidden",
                border: "2px solid var(--color-border-strong)",
              }}
            >
              {options.map(function (opt) {
                return (
                  <motion.li
                    key={opt.value}
                    aria-disabled={opt.disabled}
                    variants={optionVariants}
                    className="appearance-none"
                  >
                    <button
                      disabled={opt.disabled}
                      type="button"
                      onClick={function () {
                        onValueChange(opt.value);
                        setOpen(false);

                        triggerRef.current?.focus();
                      }}
                      className={`appearance-none hover:bg-layout-raised p-3 py-2.5
                                   transition-colors capitalize cursor-pointer font-semibold italic
                                   tracking-wide text-base w-full`}
                    >
                      {opt.label}
                    </button>
                  </motion.li>
                );
              })}
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        ref={triggerRef}
        onClick={function () {
          setOpen((p) => !p);
        }}
        className="w-full"
        type="button"
        border={false}
        color="brand"
        aria-expanded={open}
        endIcon={
          <motion.i animate={{ rotate: open ? -90 : 0 }}>
            <ChevronRight size={10} strokeWidth={5} />
          </motion.i>
        }
      >
        {label}
      </Button>
    </div>
  );
});
