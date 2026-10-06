import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import type { FieldError } from "react-hook-form";
import { Stack, type StackProps } from "./Stack";
import { cn } from "@/utils/utils";
import { Asterisk } from "lucide-react";

type Size = "xs" | "sm" | "md" | "lg";

const sizes: Record<Size, string> = {
  xs: "py-1",
  sm: `py-2`,
  md: `py-3`,
  lg: `py-4`,
};

export type InputProps = {
  size?: Size;
  error?: FieldError;
  label?: string;
  icon?: ReactNode;
} & Omit<ComponentPropsWithoutRef<"input">, "size">;

const BASE_INPUT_STYLES = `border-2 border-border-strong rounded-md outline-none w-full font-semibold placeholder:italic hover:border-border-strong placeholder:capitalize transition-colors px-3 bg-layout-raised focus:ring-4 focus:ring-brand/20 disabled:opacity-70`;

const InputElement = forwardRef<HTMLInputElement, InputProps>(
  ({ id, className, size = "sm", ...props }, ref) => {
    return (
      <input
        ref={ref}
        spellCheck={props.spellCheck ?? false}
        id={id ?? props.name}
        className={cn(BASE_INPUT_STYLES, sizes[size], className)}
        {...props}
      />
    );
  },
);

InputElement.displayName = "Input";
export default InputElement;

interface LabelProps extends Omit<
  ComponentPropsWithoutRef<"label">,
  "htmlFor"
> {
  htmlFor: string;
  children: ReactNode;
  required?: boolean;
}

export function InputLabel({
  htmlFor,
  children,
  required = true,
  className,
  ...rest
}: LabelProps) {
  return (
    <span className="inline-flex m-0 justify-start items-start gap-0.5 px-1 text-sm whitespace-nowrap">
      <label
        className={cn("capitalize text-text-normal", className)}
        htmlFor={htmlFor}
        {...rest}
      >
        {children}
      </label>
      {required && <Asterisk size={10} />}
    </span>
  );
}

export function InputGroup({
  children,
  justify = "start",
  align = "start",
  orientation = "V",
  gap = 10,
  className,
  error,
  ...props
}: { error?: string } & StackProps) {
  return (
    <Stack
      orientation={orientation}
      justify={justify}
      gap={gap}
      align={align}
      className={cn("relative", className)}
      {...props}
    >
      {children}

      {error && (
        <span
          role="alert"
          className="text-red-400 text-sm px-1 first-letter:capitalize leading-[1.2]"
        >
          {error}
        </span>
      )}
    </Stack>
  );
}

export const Input = Object.assign(InputElement, {
  Element: InputElement,
  Label: InputLabel,
  Group: InputGroup,
});
