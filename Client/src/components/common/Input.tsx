import { type InputHTMLAttributes, type ReactNode } from "react";

interface Input extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: Size;
  label?: string;
  full?: boolean;
  children?: ReactNode;
  labelClasses?: string;
}

type Size = "xs" | "sm" | "md" | "lg";

const Input = ({
  name,
  label,
  children,
  className,
  full = false,
  size = "sm",
  labelClasses = "",
  ...rest
}: Input) => {
  const classes = ["input", size.toString(), full && "w-full", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="input-box">
      {label && (
        <label htmlFor={name} className={"label " + labelClasses}>
          {label ?? name}
        </label>
      )}
      <input name={name} className={classes} {...rest} />
      {children}
    </div>
  );
};

export default Input;
