import {
  useMemo,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type LabelHTMLAttributes,
  type ReactNode,
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

Input.Label = ({
  htmlFor,
  className = "",
  children,
  size = "sm",
  color = "dark",
  ...rest
}: LabelProps) => {
  return (
    <label
      htmlFor={htmlFor}
      className={`label ${color.toString()} ${size.toString()} ${className}`}
      {...rest}
    >
      {children}
    </label>
  );
};

Input.InputElement = ({
  name,
  size = "sm",
  className = "",
  ...rest
}: InputElementProps) => {
  const classConfig = useMemo(
    function () {
      return ["input", size.toString(), className]
        .filter(Boolean)
        .join(" ")
        .trim();
    },
    [size, className]
  );

  return <input {...rest} name={name} className={`${classConfig}`} />;
};

export default Input;
