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
    <div className="relative">
      <Input
        label={label}
        id={rest.id ?? "search-bar"}
        value={val}
        placeholder={placeholder}
        className="text-sm"
        {...rest}
      />
      {clearable && val && (
        <X
          size={12}
          onClick={onClear}
          className="active:scale-98 cursor-pointer hover:scale-103 absolute right-3 top-1/2"
        />
      )}
    </div>
  );
});

export default SearchBar;
