import { memo, type ComponentPropsWithoutRef } from "react";
import { Input } from "./Input";
import type { Size } from "@/components/lib/button/variants";
import Button from "../lib/button/Button";
import { X } from "lucide-react";

interface SearchBarBaseProps extends Omit<
  ComponentPropsWithoutRef<"input">,
  "size" | "id" | "value"
> {
  size?: Size;
  id: string;
  value: string;
  placeholder?: string;
  label?: string;
}

type SearchBarProps = SearchBarBaseProps &
  (
    | {
        clearable: true;
        onClear: () => void;
      }
    | {
        clearable?: false;
        onClear?: never;
      }
  );

const SearchBar = memo(function ({
  placeholder = "search ...",
  label,
  size = "sm",
  clearable,
  value,
  onClear,
  ...rest
}: SearchBarProps) {
  return (
    <Input.Group className="relative">
      {label && (
        <Input.Label required={false} htmlFor={rest.id}>
          {label}
        </Input.Label>
      )}
      <Input.Element
        placeholder={placeholder}
        className="text-sm"
        value={value}
        data-modal-initial-focus
        size={size}
        {...rest}
      />

      {clearable && value && (
        <Button
          disabled={rest.disabled}
          className="absolute right-2 top-1/2 -translate-y-1/2"
          onClick={onClear}
          type="button"
          aria-label={`clear search.`}
          variant="icon"
        >
          <X />
        </Button>
      )}
    </Input.Group>
  );
});

export default SearchBar;
