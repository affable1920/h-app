import React, { useMemo, type ComponentPropsWithoutRef } from "react";
import Text from "./Label";

type Size = "sm" | "md" | "lg";

interface BaseProps {
  id?: string;
  label?: string;
  error?: string;
}

const sizes: Record<Size, string> = {
  sm: `text-sm p-3`,
  md: `p-4.5`,
  lg: `text-md p-6`,
};

type InputProps = BaseProps & {
  size?: Size;
} & Omit<ComponentPropsWithoutRef<"input">, "size">;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, id, className, error, size = "md", ...props }, ref) => {
    const base = `border-2 border-slate-200 rounded-md outline-none w-full font-semibold placeholder:italic
            hover:border-secondary/40 hover:ring-2 transition-colors hover:ring-accent/20 focus:ring-2 focus:ring-accent/20 px-3 text-xs`;

    const sz = sizes[size];

    const config = useMemo(
      function () {
        const config = [base, sz];
        return config.filter(Boolean).join(" ").trim();
      },
      [sz],
    );

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <Text as="label" italic bold htmlFor={id} className="px-3">
            {label}
          </Text>
        )}

        <div className="relative">
          <input id={id} ref={ref} {...props} className={`${config}`} />
          {error && (
            <Text
              italic
              bold
              className="mt-2 text-[9px] line-clamp-1 text-red-600!"
            >
              {error} !
            </Text>
          )}
        </div>
      </div>
    );
  },
);

Input.displayName = "Input";
export default Input;
