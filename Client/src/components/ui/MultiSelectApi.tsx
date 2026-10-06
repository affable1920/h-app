import { ChevronRight, MousePointer, X } from "lucide-react";
import { AnimatePresence, motion, type Variant } from "motion/react";
import { forwardRef, useState } from "react";
import Button from "./Button";
import { Stack } from "./Stack";
import Badge from "./Badge";

const dropDownVariants: Record<string, Variant> = {
  initial: {
    height: 0,
  },

  animate: {
    height: "auto",
    transition: {
      duration: 0.24,
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

type Option<T extends string | number> = {
  value: T;
  label: string;
  disabled?: boolean;
};

interface MultiSelectProps<T extends string | number> {
  label: string;
  options: Array<Option<T>>;
  selected: Array<T>; // only the values
  onValueChange: (next: Array<T>) => void;
  showSelectAll?: boolean;
  clearable?: boolean;
}

export const MultiSelect = forwardRef<
  HTMLUListElement,
  MultiSelectProps<string | number>
>(function (
  {
    label,
    clearable = true,
    options = [],
    onValueChange,
    selected = [],
    showSelectAll = false,
  },
  ref,
) {
  const [open, setOpen] = useState(false);

  function getDisplayLabel(option: Option<string | number>["value"]) {
    return options.find((o) => o.value === option)?.label;
  }

  return (
    <div className="space-y-2">
      {selected.length > 0 && (
        <Stack className="px-1" justify="between" align="start">
          <Stack
            align="center"
            className="min-w-0 grow"
            style={{ flexWrap: "wrap" }}
          >
            {selected.map(function (sel) {
              return (
                <Badge
                  onClick={function () {
                    onValueChange(selected.filter((s) => s !== sel));
                  }}
                  selected={true}
                  full={false}
                  key={sel}
                >
                  {getDisplayLabel(sel)}
                </Badge>
              );
            })}
          </Stack>

          {clearable && (
            <Button
              className="shrink-0"
              onClick={function () {
                onValueChange([]);
              }}
              data-tooltip="unselect all"
              aria-label={`clear all ${label}`}
              variant="icon"
              color="secondary"
              size="xs"
              bg={true}
            >
              <X />
            </Button>
          )}
        </Stack>
      )}
      <AnimatePresence mode="wait">
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
                    aria-disabled={opt.disabled}
                    key={opt.value}
                    variants={optionVariants}
                  >
                    <button
                      disabled={opt.disabled}
                      type="button"
                      onClick={function () {
                        onValueChange(
                          selected.includes(opt.value)
                            ? selected.filter((s) => s !== opt.value)
                            : [...selected, opt.value],
                        );
                      }}
                      className={`appearance-none hover:bg-layout-raised p-3 py-2.5
                                   transition-colors capitalize cursor-pointer font-semibold italic
                                   tracking-wide text-base w-full text-left`}
                    >
                      {opt.label}
                    </button>
                  </motion.li>
                );
              })}
            </motion.ul>

            {showSelectAll && (
              <div className="flex justify-end">
                <Button
                  onClick={function () {
                    onValueChange([...options.map((o) => o.value)]);
                  }}
                  color="indicator"
                  size="xs"
                  endIcon={<MousePointer strokeWidth={3} size={10} />}
                  className="bg-indicator px-2.5"
                >
                  All
                </Button>
              </div>
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
          setOpen((p) => !p);
        }}
      >
        {label}
        <motion.i animate={{ rotate: open ? -90 : 0 }}>
          <ChevronRight size={10} strokeWidth={5} />
        </motion.i>
      </Button>
    </div>
  );
});
