import {
  type ChangeEvent,
  type ComponentPropsWithRef,
  type ReactNode,
} from "react";
import { forwardRef } from "react";
import { Minus, Plus } from "lucide-react";
import Button from "./Button";
import { Stack } from "./Stack";

type NumberDraft = number | "";

interface StepProps extends Omit<
  ComponentPropsWithRef<"input">,
  "min" | "max" | "step" | "onChange"
> {
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
  const maxValue = Number(max);
  const minValue = Number(min);

  function handleChange(ev: ChangeEvent<HTMLInputElement>) {
    onChange(ev.target.valueAsNumber);
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
          aria-label="decrease"
          id="dec"
          color="secondary"
          bg={true}
          size="sm"
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
          className="bg-layout-raised shadow-sm shadow-black/15 rounded-md ring-2 ring-border-strong 
          outline-none p-2 text-center focus:ring-3 focus:ring-sky-500/20"
          {...rest}
        />
        <Button
          size="sm"
          id="inc"
          onClick={stepUp}
          aria-label="increase"
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
          className="capitalize text-sm text-red-400 text-center leading-1.2"
        >
          {error}
        </span>
      )}
    </Stack>
  );
});

export default StepInput;
