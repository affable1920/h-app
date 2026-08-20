import { Minus, Plus } from "lucide-react";
import {
  forwardRef,
  useRef,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import Button from "./Button";
import { Stack } from "./Stack";

type StepProps = {
  label: string;
  icon?: ReactNode;
  error?: string;
  onStepUp: (n: number) => void;
  onStepDown: (n: number) => void;
  onClear?: (msg?: string) => void;
} & InputHTMLAttributes<HTMLInputElement>;

const StepInput = forwardRef<HTMLInputElement, StepProps>(function (
  {
    label,
    icon,
    min = 0,
    max,
    step = 1,
    onStepDown,
    onStepUp,
    error,
    onChange,
    onClear,
    ...rest
  },
  ref,
) {
  const maxValue = Number(max);
  const stepValue = Number(step);
  const minValue = Number(min);

  const stepRef = useRef<HTMLInputElement>(null);

  function stepUp() {
    const el = stepRef.current;

    if (!el) {
      return;
    }

    const nxt = el.valueAsNumber ?? 0 + stepValue;

    if (nxt > maxValue) {
      onClear?.("-");
      return;
    }

    onStepUp(stepValue);
  }

  function stepDown() {
    const el = stepRef.current;

    if (!el) {
      return;
    }

    const nxt = (el.valueAsNumber ?? 0) - stepValue;

    if (nxt < minValue) {
      onClear?.("-");
      return;
    }

    onStepDown(stepValue);
  }

  function handleChange(ev: ChangeEvent<HTMLInputElement>) {
    const raw = ev.target.value;
    const name = ev.target.name || ev.target.id || "field";

    if (raw.startsWith("-") || Number(raw) < minValue) {
      onClear?.(name + " cannot be less than " + minValue);
      return;
    }

    if (Number(raw) > maxValue) {
      onClear?.(name + " cannot be greater than " + maxValue);
      return;
    }

    onChange?.(ev);
  }

  return (
    <Stack orientation="V">
      <Stack justify="center" align="center">
        <p className={"form-label"}>{label}</p>
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
        >
          <Minus />
        </Button>
        <input
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          step={step}
          ref={stepRef}
          onChange={handleChange}
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
});

export default StepInput;
