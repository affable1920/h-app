import { motion } from "motion/react";
import { forwardRef, type ComponentPropsWithRef } from "react";

interface SwitchProps extends Omit<
  ComponentPropsWithRef<"input">,
  "type" | "checked" | "onChange" | "value"
> {
  onToggle: () => void;
  value: boolean;
  label?: string;
  id: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function (
  { onToggle, value, label, id, ...rest },
  ref,
) {
  return (
    <motion.label className="cursor-pointer" htmlFor={id}>
      <motion.span className="flex items-center gap-2.5">
        <motion.span
          animate={{
            color: value ? "var(--color-text)" : "var(--color-text-secondary)",
          }}
          className="capitalize text-sm inline-flex m-0"
        >
          {label}
        </motion.span>
        <input
          {...rest}
          id={id}
          role="switch"
          checked={value}
          onChange={onToggle}
          ref={ref}
          type="checkbox"
          className="peer sr-only"
        />
        <motion.span
          animate={{
            background: value
              ? "var(--color-amber-700)"
              : "var(--color-layout)",
            justifyContent: value ? "flex-end" : "flex-start",
            borderColor: value
              ? "var(--color-amber-900)"
              : "var(--color-border-strong)",
          }}
          layout
          className="w-8 h-4 rounded-lg border overflow-hidden flex cursor-pointer shadow-inner shadow-black items-center peer-focus-visible:ring-3 peer-focus-visible:ring-brand/20"
        >
          <motion.span
            animate={{
              background: value
                ? "var(--color-amber-600)"
                : "var(--color-text-secondary)",
            }}
            className="inline-flex m-0 w-1/2 h-11/12 rounded-lg shadow-lg shadow-black/40"
          />
        </motion.span>
      </motion.span>
    </motion.label>
  );
});
