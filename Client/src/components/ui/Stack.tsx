import { useBreakpoint } from "@/hooks/use-breakpoint";
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ElementType,
  type ForwardedRef,
  type JSX,
  type ReactNode,
} from "react";

const gaps = {
  xs: "8px",
  sm: "16px",
  md: "32px",
  lg: "48px",
} as const;

type GapSize = keyof typeof gaps;

type Breakpoint = "md" | "lg";
type StackPosition = "start" | "center" | "end" | "stretch" | "between";
type Orientation = "H" | "V";

const alignItemsMap: Record<StackPosition, CSSProperties["alignItems"]> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  stretch: "stretch",
  between: "stretch", // "between" has no meaning on the cross axis
};

const justifyContentMap: Record<
  StackPosition,
  CSSProperties["justifyContent"]
> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  stretch: "stretch",
  between: "space-between",
};

type StackElement = "div" | "span";
type ElementFor = { div: HTMLDivElement; span: HTMLSpanElement };

type LayoutProps = {
  orientation?: Orientation;
  justify?: StackPosition;
  align?: StackPosition;
  reverse?: boolean;
  gap?: GapSize | number;
};

export type StackProps<TAs extends StackElement = "div"> = {
  as?: TAs;
  children: ReactNode;
} & LayoutProps &
  Partial<Record<Breakpoint, LayoutProps>> &
  Omit<
    ComponentPropsWithoutRef<TAs>,
    "children" | "as" | keyof LayoutProps | Breakpoint
  >;

const StackInner = forwardRef<
  ElementFor[StackElement],
  StackProps<StackElement>
>(function ({ children, as, md, lg, ...rest }, ref) {
  const Component: ElementType = as ?? "div";
  const tier = useBreakpoint();

  const {
    orientation: baseOrientation = "H",
    reverse: baseReverse = false,
    align: baseAlign = "stretch",
    justify: baseJustify = "stretch",
    gap: baseGap = "xs",
    ...htmlAttributes
  } = rest;

  const override = tier === "lg" ? (lg ?? md) : tier === "md" ? md : undefined;

  const orientation = override?.orientation ?? baseOrientation;
  const reverse = override?.reverse ?? baseReverse;
  const align = override?.align ?? baseAlign;
  const justify = override?.justify ?? baseJustify;
  const gap = override?.gap ?? baseGap;

  const isH = orientation === "H";

  const flexDirection: CSSProperties["flexDirection"] = isH
    ? reverse
      ? "row-reverse"
      : "row"
    : reverse
      ? "column-reverse"
      : "column";

  const calculatedGap =
    typeof gap === "number" ? `${gap}px` : gaps[gap as GapSize];

  const style: CSSProperties = {
    ...htmlAttributes.style,
    display: "flex",
    flexDirection,
    alignItems: alignItemsMap[isH ? align : justify],
    gap: calculatedGap,
    justifyContent: justifyContentMap[isH ? justify : align],
  };

  return (
    <Component
      {...htmlAttributes}
      ref={ref as ForwardedRef<HTMLDivElement>}
      style={style}
    >
      {children}
    </Component>
  );
});

export const Stack = StackInner as <TAs extends StackElement>(
  props: StackProps<TAs> & {
    ref?: ForwardedRef<ElementFor[TAs]>;
  },
) => JSX.Element;
