import { forwardRef, useMemo, type ComponentPropsWithoutRef } from "react";
import type { FieldError } from "react-hook-form";
import { Stack } from "./Stack";

type Size = "sm" | "md" | "lg";

const sizes: Record<Size, string> = {
  sm: `py-2`,
  md: `py-3`,
  lg: `py-4`,
};

export type InputProps = {
  size?: Size;
  error?: FieldError;
  label?: string;
  orientation?: "H" | "V";
} & Omit<ComponentPropsWithoutRef<"input">, "size">;

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, id, className, error, orientation = "V", size = "sm", ...props },
    ref,
  ) => {
    const inputStyles = useMemo(
      function () {
        const base = `border-2 border-border-strong rounded-md outline-none w-full font-semibold 
        placeholder:italic hover:border-border-strong placeholder:capitalize transition-colors px-3 
        bg-layout-raised`;

        return [base, sizes[size], className].filter(Boolean).join(" ").trim();
      },
      [className, size],
    );

    return (
      <Stack
        orientation={orientation}
        align={orientation === "H" ? "center" : "stretch"}
        gap="xs"
      >
        {label && (
          <label
            htmlFor={id ?? props.name}
            className="capitalize inline-flex px-1 text-sm"
          >
            {label}
          </label>
        )}

        <input
          id={id ?? props.name}
          ref={ref}
          {...props}
          className={inputStyles}
        />

        <div className="text-red-400 text-sm px-1">{error?.message}</div>
      </Stack>
    );
  },
);

Input.displayName = "Input";
export default Input;
