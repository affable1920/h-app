import { motion } from "motion/react";
import { memo, type HTMLAttributes } from "react";
import { Stack } from "./Stack";

interface Props extends HTMLAttributes<"article"> {
  toggle: () => void;
  isOn: boolean;
  label?: string;
}

const Switch = memo(function ({ label, isOn, toggle }: Props) {
  return (
    <Stack gap="xs" justify="end" align="center">
      {label && (
        <motion.p
          animate={{
            opacity: isOn ? 1 : 0.5,
            color: isOn ? "var(--color-accentdark)" : "",
          }}
          className="font-semibold first-letter:capitalize"
        >
          {label}
        </motion.p>
      )}
      <motion.div
        onClick={toggle}
        animate={{
          background: isOn
            ? "var(--color-border-vivid)"
            : "var(--color-layout)",
          justifyContent: isOn ? "flex-end" : "flex-start",
        }}
        className=" w-8 h-4 rounded-lg border-2 overflow-hidden 
            border-border-strong flex items-center gap-1 cursor-pointer"
      >
        <motion.span
          animate={{
            background: isOn
              ? "var(--color-text)"
              : "var(--color-text-secondary)",
          }}
          className="inline-flex w-1/2 h-full rounded-md shadow-md"
        />
      </motion.div>
    </Stack>
  );
});

export default Switch;
