import React from "react";
import Text from "./Label";

interface AnimatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id?: string;
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, AnimatedInputProps>(
  ({ label, id, className, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <Text as="label" italic bold htmlFor={id}>
            {label}
          </Text>
        )}

        <div className="relative">
          <input
            id={id}
            ref={ref}
            {...props}
            className={`border-2 border-slate-200 rounded-md outline-none w-full font-semibold placeholder:italic
            hover:border-secondary/40 hover:ring-2 transition-colors hover:ring-accent/20 focus:ring-2 focus:ring-accent/20 p-3 text-xs ${className}`}
          />
          {error && (
            <Text italic bold className="mt-2 text-[9px] text-red-600!">
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
