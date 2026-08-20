import { Minus, Plus } from "lucide-react";
import type { ChangeEvent, InputHTMLAttributes } from "react";
import Button from "./Button";
import { Stack } from "./Stack";

interface ControlledInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "onInvalid"
> {
  label?: string;
  error?: string;
  onChange: (val?: string) => void;
  onInvalid?: (reason: string) => void;
}

export function ControlledStepInput({
  min = 1,
  max,
  step = 1,
  value,
  onChange,
  name,
  onInvalid,
  label,
  error,
  ...rest
}: ControlledInputProps) {
  const minValue = Number(min);
  const maxValue = Number(max);
  const stepValue = Number(step);
  const currentValue = value === "" || value == null ? minValue : Number(value);

  function stepDown() {
    if (currentValue === minValue) {
      onInvalid?.("-");
      return;
    }

    const nxt = Math.max(currentValue - stepValue, minValue);

    if (nxt <= minValue) {
      onInvalid?.("-");
      return;
    }

    /** call onchange recieved from the parent on value update
     *  the parent updates whatever form field or state it wants
     * we don't care what that field is, it's in sync with out input's value
     * thus a [controlled input]
     * */

    onChange(String(nxt));
  }

  function stepUp() {
    if (currentValue === maxValue) {
      onInvalid?.("-");
      return;
    }

    const nxt = Math.min(currentValue + stepValue, maxValue);

    if (nxt > maxValue) {
      onInvalid?.("-");
      return;
    }

    onChange(String(nxt));
  }

  function handleChange(ev: ChangeEvent<HTMLInputElement>) {
    const raw = ev.currentTarget.value;
    const fieldName = name || rest.id || "field";

    if (raw.startsWith("-")) {
      onInvalid?.(`${fieldName} cannot be negative.`);
      return;
    }

    if (Number(raw) > maxValue) {
      onInvalid?.(`${fieldName} cannot be greater than ${max}`);
      return;
    }

    onChange(raw);
  }

  return (
    <Stack orientation="V">
      <Stack justify="center" align="center">
        <label htmlFor={rest.id ?? name} className="form-label">
          {label}
        </label>
      </Stack>
      <Stack align="center" justify="center" gap="sm">
        <Button
          variant="icon"
          aria-label="decrease"
          id="dec"
          color="secondary"
          bg={true}
          size="sm"
          onClick={stepDown}
        >
          <Minus />
        </Button>
        <input
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={value}
          step={step}
          onChange={handleChange}
          name={name}
          className="bg-layout-raised shadow-sm shadow-black/15 rounded-md ring-2 ring-border-strong 
          outline-none p-2 text-center focus:ring-3 focus:ring-sky-500/20"
          {...rest}
        />
        <Button
          size="sm"
          id="inc"
          aria-label="increase"
          variant="icon"
          bg={true}
          color="secondary"
          onClick={stepUp}
        >
          <Plus />
        </Button>
      </Stack>
      {error && (
        <span
          role="alert"
          className="capitalize text-sm text-red-400 text-center leading-1.2"
        >
          {error}
        </span>
      )}
    </Stack>
  );
}
