import {
  type ChangeEvent,
  type ComponentPropsWithRef,
  type ReactNode,
} from "react";
import { forwardRef } from "react";
import { Minus, Plus } from "lucide-react";
import Button from "../lib/button/Button";
import { Stack } from "./Stack";

type NumberDraft = number | "";

interface StepProps extends Omit<
  ComponentPropsWithRef<"input">,
  "min" | "max" | "step" | "onChange" | "id"
> {
  id: string;
  label: string;
  icon?: ReactNode;
  error?: string;
  step: NumberDraft;
  min?: number;
  onChange: (next: NumberDraft) => void;
  max?: number;
}

const StepInput = forwardRef<HTMLInputElement, StepProps>(function (
  {
    label,
    icon,
    name,
    id,
    min = 0,
    max,
    step = 1,
    error,
    value = "",
    onChange,
    ...rest
  },
  ref,
) {
  const currentValue = Number(value);
  const maxValue = max ?? Infinity;
  const minValue = Number(min);

  function handleChange(ev: ChangeEvent<HTMLInputElement>) {
    const val = ev.target.value === "" ? "" : ev.target.valueAsNumber;
    onChange(val);
  }

  function stepUp() {
    const current = Number(value);
    const next = Math.min(current + Number(step), maxValue);

    onChange(next);
  }

  function stepDown() {
    const current = Number(value);
    const next = Math.max(current - Number(step), minValue);

    onChange(next);
  }

  const errorId = `${id}-error`;

  return (
    <Stack orientation="V">
      <Stack justify="center" align="center">
        <label htmlFor={id} className={"form-label text-sm"}>
          {label}
        </label>
        {icon && icon}
      </Stack>

      <Stack align="center" justify="center" gap="sm">
        <Button
          variant="icon"
          aria-label={`decrease ${label}`}
          color="secondary"
          bg={true}
          size="sm"
          type="button"
          onClick={stepDown}
          disabled={currentValue <= min}
        >
          <Minus />
        </Button>
        <input
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          step={step}
          ref={ref}
          onChange={handleChange}
          value={value}
          name={name}
          id={id}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={Boolean(error)}
          className="bg-layout-raised shadow-sm shadow-black/15 rounded-md ring-2 ring-border-strong 
          outline-none p-2 text-center focus:ring-3 focus:ring-sky-500/20"
          {...rest}
        />
        <Button
          size="sm"
          type="button"
          onClick={stepUp}
          aria-label={`increase ${label}`}
          variant="icon"
          bg={true}
          color="secondary"
          disabled={currentValue >= maxValue}
        >
          <Plus />
        </Button>
      </Stack>

      {error && (
        <span
          role="alert"
          id={errorId}
          className="capitalize text-sm text-red-400 text-center leading-1.2"
        >
          {error}
        </span>
      )}
    </Stack>
  );
});

export default StepInput;
