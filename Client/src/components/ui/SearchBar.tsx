import { memo } from "react";
import { X } from "lucide-react";
import Button from "./Button";
import Input from "./Input";

interface SearchBarProps {
  val: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  clearable?: boolean;
}

const SearchBar = memo(function ({
  val,
  onChange,
  clearable = false,
  onClear,
}: SearchBarProps) {
  return (
    <div className="relative flex items-center">
      <Input
        id="searchQuery"
        value={val}
        placeholder="Search"
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
