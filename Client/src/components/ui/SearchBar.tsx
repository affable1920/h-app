import { memo, type HTMLAttributes } from "react";
import { X } from "lucide-react";
import Input from "./Input";

interface SearchBarProps extends HTMLAttributes<HTMLInputElement> {
  val: string;
  clearable?: boolean;
  onClear?: () => void;
  placeholder?: string;
  grow?: boolean;
  label?: string;
}

const SearchBar = memo(function ({
  val,
  clearable = false,
  onClear,
  placeholder = "search ...",
  grow = false,
  label,
  ...rest
}: SearchBarProps) {
  return (
    <Input
      label={label}
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
