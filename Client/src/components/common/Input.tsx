import React, { useMemo } from "react";
import type {
  HTMLAttributes,
  InputHTMLAttributes,
  LabelHTMLAttributes,
  ReactNode,
} from "react";

type Size = "xs" | "sm" | "md" | "lg";

interface InputElementProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: Size;
}

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  size?: Size;
  color?: "dark" | "light";
}

function Input({
  children,
  className = "",
}: { children: ReactNode } & HTMLAttributes<HTMLDivElement>) {
  return <div className={`input-box ${className}`}>{children}</div>;
}

const baseLabel = `italic font-bold capitalize`;
const labelSizes: Record<Size, string> = {
  xs: "text-xs",
  sm: "text-sm",
  md: "text-lg",
  lg: "text-xl",
};

Input.Label = ({
  htmlFor,
  children,
  size = "sm",
  className = "",
  color = "dark",
  ...rest
}: LabelProps) => {
  const classConfig = [
    baseLabel,
    color === "dark" ? "text-primary" : "text-white",
    labelSizes[size],
    className,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    <label htmlFor={htmlFor} className={classConfig} {...rest}>
      {children}
    </label>
  );
};

const sizeClasses: Record<Size, string> = {
  xs: "h-6 p-0.5 px-1",
  sm: "h-8 p-1 px-2",
  md: "h-10 p-2 px-4",
  lg: "h-12 p-3 px-6",
};

Input.InputElement = React.forwardRef<HTMLInputElement, InputElementProps>(
  (props, ref) => {
    const { name, type, size = "sm", className = "", ...rest } = props;

    const classConfig = useMemo(
      function () {
        return ["input", sizeClasses[size], className]
          .filter(Boolean)
          .join(" ")
          .trim();
      },
      [size, className]
    );

    return (
      <input
        ref={ref}
        {...rest}
        type={type}
        name={name}
        className={`${classConfig}`}
      />
    );
  }
);

// Input.InputElement = ({
//   name,
//   type = "text",
//   size = "sm",
//   className = "",
//   ...rest
// }: InputElementProps) => {
//   const classConfig = useMemo(
//     function () {
//       return ["input", sizeClasses[size], className]
//         .filter(Boolean)
//         .join(" ")
//         .trim();
//     },
//     [size, className]
//   );

//   return (
//     <input {...rest} type={type} name={name} className={`${classConfig}`} />
//   );
// };

Input.Error = ({ msg }: { msg: string }) => {
  return (
    <p className="text-[9px] italic text-error-dark font-semibold first-letter:capitalize">
      {msg} !
    </p>
  );
};

export default Input;
