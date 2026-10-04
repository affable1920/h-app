import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { motion } from "motion/react";
import Button from "./Button";
import { memo } from "react";
import { Stack } from "./Stack";
import { cn } from "@/utils/utils";

interface Props {
  currentStep: number;
  onForward: () => void;
  onBack: () => void;
  showPillUi?: boolean;
  stepCount: number;
  className?: string;
  isSubmitting?: boolean;
  labelForwardBtn?: string;
  labelBackwardBtn?: string;
  labelSubmitBtn?: string;
  submitFn?: () => void;
}

export const Navigation = memo(function Navigation({
  currentStep,
  stepCount,
  showPillUi = false,
  onForward,
  onBack,
  className,
  isSubmitting = false,
  labelBackwardBtn,
  labelForwardBtn,
  labelSubmitBtn,
  submitFn,
}: Props) {
  const stepIsFinal = currentStep === stepCount - 1;

  return (
    <Stack justify="between" align="end" className={cn("mt-8", className)}>
      <Button
        disabled={currentStep === 0}
        onClick={onBack}
        type="button"
        variant="icon"
        bg={true}
        color="secondary"
        aria-label={labelBackwardBtn ?? "backward"}
        data-tooltip={labelBackwardBtn ?? "move backwards"}
      >
        <ArrowLeft />
      </Button>

      {showPillUi && (
        <div className="flex gap-2">
          {Array.from({ length: stepCount }, function (_, i) {
            return i;
          }).map(function (s) {
            return (
              <motion.span
                layout
                initial={{ height: "4px" }}
                animate={{
                  width: s === currentStep ? "24px" : "18px",
                  background:
                    s === currentStep
                      ? "var(--color-indicator)"
                      : "var(--color-border-vivid)",
                }}
                key={s}
                className="rounded-sm inline-block"
              />
            );
          })}
        </div>
      )}
      <div className="justify-self-end items-end self-end flex gap-4 justify-end">
        {!stepIsFinal && (
          <Button
            aria-label={labelForwardBtn ?? "forward"}
            data-tooltip={labelForwardBtn ?? "move forward"}
            type="button"
            bg={true}
            variant="icon"
            color="secondary"
            onClick={onForward}
          >
            <ArrowRight />
          </Button>
        )}
        {stepIsFinal && (
          <Button
            aria-label={labelSubmitBtn ?? "submit"}
            data-tooltip={labelSubmitBtn ?? "submit"}
            type="submit"
            bg={true}
            disabled={isSubmitting}
            color="secondary"
            onClick={submitFn}
            variant="icon"
          >
            {isSubmitting ? "..." : <Check />}
          </Button>
        )}
      </div>
    </Stack>
  );
});
