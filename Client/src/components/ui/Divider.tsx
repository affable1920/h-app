import type { Color } from "@/types/ui";
import { memo, type CSSProperties, type ElementType } from "react";

type Labelposition = "start" | "center" | "end";
type DividerColor = "primary" | "secondary" | "white";

type LabelProps = {
  as?: ElementType;
  text: string;
  position: Labelposition;
  styles?: CSSProperties;
  className?: string;
  color?: Color;
};

interface DividerProps {
  orientation?: "horizontal" | "vertical";
  label?: LabelProps;
  size?: "sm" | "md" | "lg";
  color?: DividerColor;
  styles?: CSSProperties;
  className?: string;
}

const sizes: Record<"sm" | "md" | "lg", string> = {
  sm: "h-0.5",
  md: "h-1",
  lg: "h-2",
};

const colors: Record<DividerColor, string> = {
  primary: "bg-border-vivid",
  white: "bg-text-normal",
  secondary: "bg-layout-raised",
};

const Divider = memo(function ({
  label,
  size = "sm",
  orientation = "horizontal",
  color = "primary",
}: DividerProps) {
  const lineStyles = ["inline-flex w-full", sizes[size], colors[color]]
    .filter(Boolean)
    .join(" ")
    .trim();

  const lblColor = label?.color
    ? colors[label.color as DividerColor]
    : colors[color];

  const lblStyles = [
    "shrink-0 capitalize inline-flex",
    label?.position === "end" ? "order-1" : "order-0",
    "text" + lblColor.slice(3),
    label?.className,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  if (orientation === "horizontal") {
    return (
      <article className={`flex items-center gap-4`}>
        {label &&
          (label.position === "start" || label.position === "end") &&
          (function () {
            const Label = label.as || "p";

            return (
              <>
                <Label className={lblStyles} {...label}>
                  {label.text}
                </Label>
                <span className={lineStyles} />
              </>
            );
          })()}

        {label &&
          label.position === "center" &&
          (function () {
            const Label = label.as || "p";

            return (
              <>
                <span className={lineStyles} />
                <Label className={lblStyles}>{label.text}</Label>
                <span className={lineStyles} />
              </>
            );
          })()}

        {!label && <span className={lineStyles} />}
      </article>
    );
  }

  return (
    <article className={`flex flex-col gap-4`}>
      {label &&
        (label.position === "start" || label.position === "end") &&
        (function () {
          const Label = label.as || "p";

          return (
            <>
              <Label
                style={{
                  order: label.position === "start" ? 0 : 1,
                }}
                className={lblStyles}
              >
                {label.text}
              </Label>
              <span className={lineStyles} />
            </>
          );
        })()}

      {label &&
        label.position === "center" &&
        (function () {
          const Label = label.as || "p";

          return (
            <>
              <span className={lineStyles} />
              <Label className={lblStyles}>{label.text}</Label>
              <span className={lineStyles} />
            </>
          );
        })()}

      {!label && <span className={lineStyles} />}
    </article>
  );
});

export default Divider;
