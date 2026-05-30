import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { motion } from "motion/react";
import Button from "./Button";
import { memo } from "react";
import { Stack } from "./Stack";

interface Props {
  currentStep: number;
  navigateBack: () => void;
  navigateForward: () => void;
  showPillUi?: boolean;
  stepCount: number;
  submitFn?: (data?: any) => void | Promise<void>;
}

export const Navigation = memo(function Navigation({
  currentStep,
  navigateBack,
  stepCount,
  navigateForward,
  showPillUi = false,
}: Props) {
  const isFinalStep = currentStep === stepCount - 1;

  return (
    <Stack justify="between" align="center" className="mt-8">
      <Button
        disabled={currentStep === 0}
        onClick={navigateBack}
        type="button"
        variant="icon"
      >
        <ArrowLeft />
      </Button>

      {showPillUi && (
        <div className="flex gap-2">
          {Array.from({ length: stepCount }, (_, i) => i).map((s) => (
            <motion.span
              layout
              initial={{ height: "4px" }}
              animate={{
                width: s === currentStep ? "28px" : "16px",
                background:
                  s === currentStep
                    ? "var(--color-brand)"
                    : "var(--color-border-vivid)",
              }}
              key={s}
              className="rounded-sm inline-block"
            />
          ))}
        </div>
      )}
      <div className="justify-self-end items-center flex gap-4 justify-end">
        {!isFinalStep && (
          <Button type="button" onClick={navigateForward} variant="icon">
            <ArrowRight />
          </Button>
        )}
        {isFinalStep && (
          <Button type="submit" variant="icon">
            <Check />
          </Button>
        )}
      </div>
    </Stack>
  );
});
