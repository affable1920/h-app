import { type InputHTMLAttributes } from "react";
import { capitalize } from "@/utils/appUtils";

const Input = ({
  name,
  label,
  value,
  className,
  type = "text",
  ...rest
}: {
  label?: string;
} & InputHTMLAttributes<HTMLInputElement>) => {
  const classes = ["input", className].filter(Boolean).join(" ");

  return (
    <div className="flex flex-col tracking-widest">
      {label && (
        <label htmlFor={name} className="card-h2 italic">
          {capitalize(label ?? name)}
        </label>
      )}
      <input type={type} value={value} {...rest} className={classes} />
    </div>
  );
};

export default Input;
