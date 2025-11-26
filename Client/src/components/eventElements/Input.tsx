import { type InputHTMLAttributes, type ReactNode } from "react";
import { capitalize } from "@/utils/appUtils";

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
  value,
  children,
  className,
  full = false,
  size = "sm",
  type = "text",
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
          {capitalize(label ?? name)}
        </label>
      )}
      <input
        name={name}
        type={type}
        value={value}
        className={classes}
        {...rest}
      />
      {children}
    </div>
  );
};

export default Input;
