import { useBreakpoint } from "@/hooks/use-breakpoint";
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ForwardedRef,
  type JSX,
  type ReactNode,
} from "react";

const GAPSIZES = ["xs", "sm", "md", "lg"] as const;
type GapSize = (typeof GAPSIZES)[number];

type Breakpoint = "md" | "lg";
type StackPosition = "start" | "center" | "end" | "stretch" | "between";

const gaps: Record<GapSize, string> = {
  xs: "8px",
  sm: "16px",
  md: "32px",
  lg: "48px",
};

type LayoutProps = {
  gap?: GapSize | number;
  reverse?: boolean;
  justify?: StackPosition;
  align?: StackPosition;
  orientation?: "H" | "V";
};

export type StackProps<TAs extends "div" | "span" = "div"> = {
  as?: TAs;
  children: ReactNode;
} & LayoutProps &
  Omit<ComponentPropsWithoutRef<TAs>, "children" | "as"> & {
    [brk in Breakpoint]?: LayoutProps;
  };

// ============================================================================================
// INNER COMPONENT WITH FORWARDREF ---
const StackInner = forwardRef<any, StackProps<any>>(function (
  { children, as, md, lg, ...rest },
  ref,
) {
  const Component = as ?? "div";
  const tier = useBreakpoint();

  // Extract layout-only props which should be overridden per tier
  const {
    orientation: baseOrientation = "H",
    reverse: baseReverse = false,
    align: baseAlign = "stretch",
    justify: baseJustify = "stretch",
    gap: baseGap = "xs",
    ...htmlAttributes
  } = rest;

  const breakpointOverride =
    tier === "lg" ? (lg ?? md) : tier === "md" ? md : undefined;

  const orientation = breakpointOverride?.orientation ?? baseOrientation;
  const reverse = breakpointOverride?.reverse ?? baseReverse;
  const align = breakpointOverride?.align ?? baseAlign;
  const justify = breakpointOverride?.justify ?? baseJustify;
  const gap = breakpointOverride?.gap ?? baseGap;

  const getOrientation =
    orientation === "H"
      ? reverse
        ? "row-reverse"
        : "row"
      : reverse
        ? "column-reverse"
        : "column";

  const calculatedGap =
    typeof gap === "number" ? `${gap}px` : gaps[gap as GapSize];

  return (
    <Component
      {...htmlAttributes}
      ref={ref}
      style={{
        ...htmlAttributes.style,
        display: "flex",
        flexDirection: getOrientation,
        alignItems: orientation === "H" ? align : justify,
        gap: calculatedGap,
        justifyContent:
          orientation === "H"
            ? justify === "between"
              ? "space" + "-between"
              : justify
            : align,
      }}
    >
      {children}
    </Component>
  );
});

// ============================================================================================
// STRICT TYPE CASTED EXPORT ---
// This casting explicitly allows the 'as' prop to properly change the Ref's typings dynamically

export const Stack = StackInner as <TAs extends "div" | "span">(
  props: StackProps<TAs> & {
    ref?: ForwardedRef<TAs extends "div" ? HTMLDivElement : HTMLSpanElement>;
  },
) => JSX.Element;
