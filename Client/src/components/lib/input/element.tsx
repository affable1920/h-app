import type { Color } from "@/types/ui";
import { forwardRef, useMemo, type ComponentPropsWithoutRef } from "react";

type Size = "sm" | "md" | "lg";

const sizes: Record<Size, string> = {
  sm: `py-2`,
  md: `py-3`,
  lg: `py-4`,
};

interface InputProps extends Omit<ComponentPropsWithoutRef<"input">, "size"> {
  size?: Size;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function (
  { size = "sm", className, ...props },
  ref,
) {
  const inputStyles = useMemo(
    function () {
      const base = `border-2 border-border-strong rounded-md outline-none w-full font-semibold 
            placeholder:italic hover:border-border-strong placeholder:capitalize transition-colors px-3 
            bg-layout-raised`;

      return [base, sizes[size], className].filter(Boolean).join(" ").trim();
    },
    [className, size],
  );

  return <input className={inputStyles} ref={ref} {...props} />;
});

const labelSize = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-md",
};

export function InputLabel({
  size = "sm",
  el,
  className,
  ...rest
}: Omit<ComponentPropsWithoutRef<"label">, "size" | "htmlFor"> & {
  el: string;
  size?: Size;
  color?: Color;
}) {
  const classes = ["capitalize inline-flex px-1", labelSize[size], className]
    .filter(Boolean)
    .join(" ")
    .trim();

  return <label htmlFor={el} className={classes} {...rest} />;
}
