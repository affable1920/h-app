import { memo } from "react";
import { X } from "lucide-react";
import Input from "./Input";

interface SearchBarProps {
  val: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  clearable?: boolean;
  placeholder?: string;
}

const SearchBar = memo(function ({
  val,
  onChange,
  clearable = false,
  onClear,
  placeholder = "search ...",
}: SearchBarProps) {
  return (
    <div className="relative flex items-center">
      <Input
        id="search-query"
        value={val}
        placeholder={placeholder}
        size="sm"
        className="italic placeholder:text-sm py-2"
        onChange={function (ev) {
          onChange(ev.target.value);
        }}
      />
      {clearable && val && (
        <X
          size={12}
          onClick={onClear}
          className="absolute right-3 active:scale-98 cursor-pointer hover:scale-103"
        />
      )}
    </div>
  );
});

export default SearchBar;
