import { motion } from "motion/react";
import { forwardRef, type ComponentPropsWithRef } from "react";

interface SwitchProps extends ComponentPropsWithRef<"input"> {
  toggle: () => void;
  isOn: boolean;
  label?: string;
  id: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function (
  { toggle, isOn, label, id, ...rest },
  ref,
) {
  return (
    <motion.label onClick={toggle} className="cursor-pointer" htmlFor={id}>
      <motion.div className="flex items-center gap-2.5">
        <motion.span
          animate={{
            color: isOn ? "var(--color-text)" : "var(--color-text-secondary)",
          }}
          className="capitalize text-sm inline-flex m-0"
        >
          {label}
        </motion.span>
        <input
          checked={isOn}
          onChange={toggle}
          aria-checked={isOn}
          ref={ref}
          type="radio"
          style={{ display: "none" }}
          {...rest}
        />
        <motion.div
          animate={{
            background: isOn ? "var(--color-amber-700)" : "var(--color-layout)",
            justifyContent: isOn ? "flex-end" : "flex-start",
            borderColor: isOn
              ? "var(--color-amber-900)"
              : "var(--color-border-strong)",
          }}
          layout
          className="w-8 h-4 rounded-lg border overflow-hidden flex cursor-pointer shadow-inner shadow-black items-center"
        >
          <motion.span
            animate={{
              background: isOn
                ? "var(--color-amber-600)"
                : "var(--color-text-secondary)",
            }}
            className="inline-flex m-0 w-1/2 h-11/12 rounded-lg shadow-lg shadow-black/40"
          />
        </motion.div>
      </motion.div>
    </motion.label>
  );
});
