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
      {clearable && (
        <Button
          className="absolute right-3 active:scale-95 transition-transform"
          variant="icon"
          size="sm"
          onClick={onClear}
        >
          <X />
        </Button>
      )}
    </div>
  );
});

export default SearchBar;
