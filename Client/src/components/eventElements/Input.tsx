import React from "react";
import Button from "./Button";
import { X } from "lucide-react";
import { capitalize } from "@/utils/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  onReset?: () => void;
}

const Input = ({
  label,
  value,
  onReset,
  type = "text",
  className,
  ...rest
}: InputProps) => {
  const classes = [
    `outline-none w-full border-2 border-slate-200/40 p-4 py-3 rounded-md 
    tracking-widest`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="flex flex-col tracking-widest">
      <label htmlFor={label} className="label text-base">
        {label && capitalize(label)}
      </label>
      <div className="relative">
        {type === "range" && (
          <div className="flex justify-between items-center italic font-bold">
            <span>{rest?.min} km</span>
            <span>{rest?.max} km</span>
          </div>
        )}
        <input type={type} value={value} {...rest} className={classes} />
        {type === "text" && value && (
          <Button
            variant="icon"
            onClick={onReset}
            className="absolute top-1/2 -translate-y-1/2 right-4 cursor-pointer"
          >
            <X size={10} />
          </Button>
        )}
      </div>
    </div>
  );
};

export default Input;
