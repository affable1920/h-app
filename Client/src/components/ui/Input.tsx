import type { Color } from "@/types/ui";
import React, {
  useMemo,
  type ComponentPropsWithoutRef,
  type CSSProperties,
} from "react";
import type { FieldError } from "react-hook-form";

type Size = "sm" | "md" | "lg";

interface BaseProps {
  label?: string;
  error?: FieldError;
}

const sizes: Record<Size, string> = {
  sm: `py-2`,
  md: `py-3`,
  lg: `py-4`,
};

const textSizes: Record<Size, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-md",
};

type TextProps = {
  size?: Size;
  color?: Color;
  style?: CSSProperties;
  className?: string;
  truncate?: number | false;
};

type Rest = {
  size?: Size;
  color?: string;

  label?: Rest;
};

type InputProps = BaseProps & {
  size?: Size;
  rest?: Rest;
} & Omit<ComponentPropsWithoutRef<"input">, "size">;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, id, className, error, size = "sm", rest, ...props }, ref) => {
    const base = `border-2 border-border-strong rounded-md outline-none w-full font-semibold placeholder:italic
            hover:border-border-strong placeholder:capitalize transition-colors px-3 bg-layout-raised`;

    const sz = sizes[size];

    const txtSz = textSizes[rest?.size ?? "sm"];
    const lblSz = rest?.label?.size ? textSizes[rest.label.size] : txtSz;

    const inputStyles = useMemo(
      function () {
        return [base, sz, txtSz].filter(Boolean).join(" ").trim();
      },
      [sz, txtSz],
    );

    const lblStyles = useMemo(
      function () {
        return ["px-1", "capitalize", "inline-flex", lblSz]
          .filter(Boolean)
          .join(" ")
          .trim();
      },
      [lblSz],
    );

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label htmlFor={id ?? props.name} className={`${lblStyles}`}>
            {label}{" "}
          </label>
        )}

        <input
          id={id}
          ref={ref}
          {...props}
          className={`${inputStyles + ` ${txtSz}`}`}
        />

        {error && (
          <div className="text-red-400 text-sm px-1">{error.message}</div>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
export default Input;
