import { memo, type HTMLAttributes } from "react";
import { X } from "lucide-react";
import InputElement from "./Input";
import type { Size } from "@/types/ui";

interface SearchBarProps extends Omit<
  HTMLAttributes<HTMLInputElement>,
  "size"
> {
  val: string;
  clearable?: boolean;
  onClear?: () => void;
  placeholder?: string;
  grow?: boolean;
  label?: string;
  size?: Size;
  disabled?: boolean;
}

const SearchBar = memo(function ({
  val,
  clearable = false,
  onClear,
  placeholder = "search ...",
  label,
  size = "sm",
  disabled = false,
  ...rest
}: SearchBarProps) {
  return (
    <InputElement
      size={size}
      label={label}
      disabled={disabled}
      id={rest.id ?? "search-bar"}
      value={val}
      placeholder={placeholder}
      className="text-sm"
      icon={
        val ? (
          <X
            size={12}
            onClick={onClear}
            className={`cursor-pointer ${clearable ? "visible" : "invisible"}`}
          />
        ) : null
      }
      {...rest}
    />
  );
});

export default SearchBar;
