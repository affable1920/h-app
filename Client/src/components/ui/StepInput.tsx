import { Minus, Plus } from "lucide-react";
import {
  forwardRef,
  useImperativeHandle,
  useRef,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import Button from "./Button";
import { Stack } from "./Stack";
import { toast } from "sonner";

const labelStyle = "text-text-normal capitalize text-center";

export type StepHandle = {
  stepUp: () => void;
  stepDown: () => void;
  handleChange: () => void;
  val?: number;
};

type StepProps = {
  label: string;
  icon?: ReactNode;
  onStepUp: (n: number) => void;
  onStepDown: (n: number) => void;
  warn?: "true" | "false";
} & InputHTMLAttributes<HTMLInputElement>;

const StepInput = forwardRef<StepHandle, StepProps>(function (
  { label, warn = "true", icon, onStepDown, onStepUp, ...rest },
  ref,
) {
  const stepRef = useRef<HTMLInputElement>(null);

  function shouldWarn(input: string | null, msg: string) {
    if (warn === "false") {
      return;
    } else {
      toast(`${input} ${msg}`, {
        className: "capitalize",
      });
    }
  }

  useImperativeHandle<StepHandle, StepHandle>(ref, function () {
    return {
      stepUp() {
        const el = stepRef.current;

        if (!el) {
          return;
        }

        if (Number(el.value) >= Number(el.max)) {
          return;
        }

        el.stepUp();
      },

      stepDown() {
        const el = stepRef.current;

        if (!el) {
          return;
        }
        const minReached =
          !el.value.trim() ||
          Number(el.value) === Number(el.step) ||
          Number(el.value) <= Number(el.min);

        if (minReached) {
          el.placeholder = "-";
          el.value = "";
          return;
        } else {
          el.stepDown();
        }
      },

      handleChange() {
        const el = stepRef.current;

        if (!el) {
          return;
        }

        const val = el.value;
        const name = el.id || el.name || "value";

        if (val.startsWith("-")) {
          el.placeholder = "-";
          el.value = "";
          shouldWarn(name, "can not be negative !");
          return;
        }

        if (Number(val) > Number(el.max)) {
          el.placeholder = "-";
          el.value = "";
          shouldWarn(name, "can not be greater than " + el.max);
          return;
        }

        el.value = val;
      },
    };
  });

  return (
    <Stack orientation="V" gap="sm">
      <Stack justify="center" align="center">
        <p className={labelStyle}>{label}</p>
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
          onClick={function () {
            onStepDown(Number(rest.step));
          }}
        >
          <Minus />
        </Button>
        <input
          ref={stepRef}
          type="number"
          inputMode="numeric"
          className="bg-layout-raised shadow-sm shadow-black/15 rounded-md ring-2 ring-border-strong 
          outline-none p-2 text-center"
          {...rest}
        />
        <Button
          size="sm"
          id="inc"
          aria-label="Increase"
          variant="icon"
          bg={true}
          color="secondary"
          onClick={function () {
            onStepUp(Number(rest.step));
          }}
        >
          <Plus />
        </Button>
      </Stack>
    </Stack>
  );
});

export default StepInput;
