import { cn } from "@/utils/utils";
import { motion } from "motion/react";

type SummaryColor = "dark" | "secondary" | "green" | "blue";

type Summary = {
  key: string;
  value: unknown;
  color: SummaryColor;
  className?: string;
};

type SummaryProps = {
  items: Array<Summary>;
  sortFn?: (a: Summary, b: Summary) => number;
};

const statusPresentation: Record<
  SummaryColor,
  { label: string; classes: string }
> = {
  blue: {
    label: "Active",
    classes: "border-indicator/25 bg-indicator/10 text-indicator",
  },
  green: {
    label: "Completed",
    classes: "border-emerald-300/25 bg-emerald-300/10 text-emerald-300",
  },
  dark: {
    label: "Cancelled",
    classes: "bg-layout-raised",
  },
  secondary: {
    label: "Missed",
    classes: "border-amber-300/25 bg-amber-300/10 text-amber-300",
  },
};

export function ViewSummary({ items, sortFn }: SummaryProps) {
  return (
    <motion.article
      role="status"
      aria-live="polite"
      aria-atomic="true"
      initial={{ x: "20px" }}
      animate={{ x: 0 }}
      exit={{
        x: "15px",
        transition: {
          duration: 0.1,
          ease: "easeIn",
        },
      }}
      transition={{
        ease: "easeOut",
        duration: 0.2,
      }}
      className="italic flex flex-wrap gap-4 gap-y-3 items-end"
    >
      {items.sort(sortFn).map(function (summary) {
        return (
          <div
            className={cn(
              "flex gap-2 items-end flex-1 not-first:justify-end",
              summary.className,
            )}
          >
            <span
              key={summary.key}
              className={"inline-flex capitalize whitespace-nowrap"}
            >
              {summary.key}:{" "}
            </span>
            <span
              className={cn(
                "px-2 py-[0.25] rounded-md text-sm ring-1 inline-flex ring-current/30 mx-1",
                statusPresentation[summary.color].classes,
              )}
            >
              {summary.value as string}
            </span>
          </div>
        );
      })}
    </motion.article>
  );
}
