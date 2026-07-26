import { Minus, Plus } from "lucide-react";
import { forwardRef, type InputHTMLAttributes } from "react";
import Button from "./Button";
import { Stack } from "./Stack";

const labelFilters = "text-text-normal capitalize text-center";

type StepProps = {
  label: string;
  stepDown: () => void;
  stepUp: () => void;
} & InputHTMLAttributes<HTMLInputElement>;

const StepInput = forwardRef<HTMLInputElement, StepProps>(function (
  { label, stepDown, stepUp, ...rest },
  ref,
) {
  return (
    <Stack orientation="V" gap="sm">
      <p className={labelFilters}>{label}</p>
      <Stack align="center" justify="center" gap="sm">
        <Button
          variant="icon"
          aria-label="decrease"
          id="dec"
          color="secondary"
          onClick={stepDown}
          bg={true}
          size="sm"
        >
          <Minus />
        </Button>
        <input
          ref={ref}
          type={"number"}
          inputMode="numeric"
          pattern="[0-9]"
          className="bg-layout-raised shadow-sm shadow-black/15 rounded-md ring-2 
            ring-border-strong outline-none p-2 text-center"
          {...rest}
        />
        <Button
          size="sm"
          id="inc"
          aria-label="Increase"
          variant="icon"
          bg={true}
          color="secondary"
          onClick={stepUp}
        >
          <Plus />
        </Button>
      </Stack>
    </Stack>
  );
});

export default StepInput;
