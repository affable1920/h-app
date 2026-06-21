import {
  memo,
  useMemo,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";

const GAPSIZES = ["xs", "sm", "md", "lg"];
type GapSize = (typeof GAPSIZES)[number];

type StackPosition = "start" | "center" | "end" | "stretch" | "between";

export interface StackProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  gap?: GapSize;
  reverse?: boolean;
  styles?: CSSProperties;
  className?: string;
  justify?: StackPosition;
  align?: StackPosition;
  orientation?: "H" | "V";
}

const gaps: Record<GapSize, string> = {
  xs: "8px",
  sm: "16px",
  md: "32px",
  lg: "48px",
};

export const Stack = memo(function ({
  gap = "sm",
  reverse = false,
  orientation = "H",
  justify = "stretch",
  align = "stretch",
  children,
  styles,
  className,
  ...rest
}: StackProps) {
  const getOrientation = useMemo(
    function () {
      return orientation === "H"
        ? reverse
          ? "row-reverse"
          : "row"
        : reverse
          ? "column-reverse"
          : "column";
    },
    [orientation, reverse],
  );

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
        ...styles,
      }}
      className={className}
    >
      {children}
    </article>
  );
});
