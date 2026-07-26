import { useBreakpoint } from "@/hooks/use-breakpoint";
import { memo, type HTMLAttributes, type ReactNode } from "react";

const GAPSIZES = ["xs", "sm", "md", "lg"] as const;
type GapSize = (typeof GAPSIZES)[number];

type Breakpoint = "md" | "lg";
type StackPosition = "start" | "center" | "end" | "stretch" | "between";

export type StackProps = HTMLAttributes<HTMLElement> & {
  [breakPoint in Breakpoint]?: Omit<StackProps, "children">;
} & {
  children: ReactNode;
  gap?: GapSize;
  reverse?: boolean;
  justify?: StackPosition;
  align?: StackPosition;
  orientation?: "H" | "V";
};

const gaps: Record<GapSize, string> = {
  xs: "8px",
  sm: "16px",
  md: "32px",
  lg: "48px",
};

export const Stack = memo(function ({ md, lg, children, ...rest }: StackProps) {
  const tier = useBreakpoint();
  const source =
    tier === "lg" ? (lg ?? rest) : tier === "md" ? (md ?? rest) : rest;

  const {
    orientation = "H",
    reverse = false,
    align = "stretch",
    justify = "stretch",
    gap = "xs",
  } = source;

  const getOrientation =
    orientation === "H"
      ? reverse
        ? "row-reverse"
        : "row"
      : reverse
        ? "column-reverse"
        : "column";

  return (
    <article
      {...rest}
      style={{
        display: "flex",
        flexDirection: getOrientation,
        alignItems: orientation === "H" ? align : justify,
        gap: gaps[gap],
        justifyContent:
          orientation === "H"
            ? justify === "between"
              ? "space" + "-between"
              : justify
            : align,
        ...rest.style,
      }}
    >
      {children}
    </article>
  );
});
