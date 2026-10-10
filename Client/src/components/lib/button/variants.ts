import type { ComponentPropsWithoutRef, ReactNode } from "react";

export const COLORS = [
  "brand",
  "white",
  "indicator",
  "primary",
  "secondary",
  "danger",
  "warning",
  "success",
] as const;
export const SIZES = ["xs", "sm", "md", "lg"] as const;
export const VARIANTS = ["contained", "icon"] as const;

export type Size = (typeof SIZES)[number];
export type Color = (typeof COLORS)[number];
export type Variant = (typeof VARIANTS)[number];

export type ButtonStyleProps = {
  size?: Size;
  color?: Color;
  variant?: Variant;
  border?: boolean;
  bg?: boolean;
};

export type ButtonProps = {
  loading?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
} & ButtonStyleProps &
  Omit<ComponentPropsWithoutRef<"button">, keyof ButtonStyleProps>;
