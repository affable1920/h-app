import { type InputHTMLAttributes, type ReactNode } from "react";
import { capitalize } from "@/utils/appUtils";

interface AppInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  size?: "sm" | "md";
  children?: ReactNode;
}

const Input = ({
  name,
  label,
  value,
  size = "sm",
  className,
  children,
  type = "text",
  ...rest
}: AppInputProps) => {
  const classes = ["input", size ?? "sm", className].filter(Boolean).join(" ");

  return (
    <div className="input-box">
      {label && (
        <label htmlFor={name} className="card-h2 italic">
          {capitalize(label ?? name)}
        </label>
      )}
      <input type={type} value={value} {...rest} className={classes} />
      {children}
    </div>
  );
};

export default Input;
