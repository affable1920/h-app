import {
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentPropsWithoutRef,
} from "react";
import { Input } from "./Input";
import type { Size } from "@/components/lib/button/variants";
import Button from "../lib/button/Button";
import { X } from "lucide-react";
import { debounce } from "@/utils/utils";

interface SearchBarBaseProps extends Omit<
  ComponentPropsWithoutRef<"input">,
  "size" | "id" | "value" | "onChange"
> {
  size?: Size;
  id: string;
  value: string | null;
  label?: string;
  shouldDebounce?: boolean;
  onChange: (text: string) => void;
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
  shouldDebounce = true,
  onChange,
  ...rest
}: SearchBarProps) {
  const [draft, setDraft] = useState(value ?? "");
  const latestHandleChange = useRef<typeof onChange>(onChange);
  const lastCommitted = useRef(value ?? "");

  useEffect(
    function () {
      latestHandleChange.current = onChange;
    },
    [onChange],
  );

  const memoizedCallback = useMemo(
    function () {
      if (shouldDebounce) {
        return debounce(function (sq: string) {
          lastCommitted.current = sq;
          latestHandleChange.current(sq);
        }, 300);
      } else {
        return function (sq: string) {
          lastCommitted.current = sq;
          latestHandleChange.current(sq);
        };
      }
    },
    [shouldDebounce],
  );

  useEffect(
    function () {
      if (lastCommitted.current === (value ?? "")) {
        return;
      }

      if (typeof memoizedCallback === "object") {
        memoizedCallback.cancel();
      }

      lastCommitted.current = value ?? "";
      setDraft(value ?? "");
    },
    [value, memoizedCallback],
  );

  useEffect(
    function () {
      return function () {
        if (typeof memoizedCallback === "object") {
          memoizedCallback.cancel();
        }
      };
    },
    [memoizedCallback],
  );

  function handleChange(ev: ChangeEvent<HTMLInputElement>) {
    const text = ev.target.value;

    setDraft(text);

    const callback =
      typeof memoizedCallback === "object"
        ? memoizedCallback.debounced
        : memoizedCallback;

    callback(text);
  }

  function handleClear() {
    setDraft("");

    if (typeof memoizedCallback === "object") {
      memoizedCallback.cancel();
    }

    onClear?.();
  }

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
        value={draft}
        data-modal-initial-focus
        size={size}
        onChange={handleChange}
        {...rest}
      />

      {clearable && value && (
        <Button
          className="absolute right-2 top-1/2 -translate-y-1/2"
          onClick={handleClear}
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
