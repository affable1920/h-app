/* eslint-disable @typescript-eslint/no-empty-object-type */
import type { ReactNode, ButtonHTMLAttributes } from "react";
import type { HTMLMotionProps } from "motion/react";

export const COLORS = {
  slate: "slate",
  accent: "accent",
  primary: "primary",
  danger: "danger",
  warning: "warning",
  success: "success",
  neutral: "neutral",
} as const;

export const VARIANTS = {
  icon: "icon",
  outlined: "outlined",
  contained: "contained",
} as const;

export const SIZES = {
  sm: "sm",
  md: "md",
  lg: "lg",
  xl: "xl",
} as const;

export type Size = keyof typeof SIZES;

export type Color = keyof typeof COLORS;
export type Variant = keyof typeof VARIANTS;

// these are props on all buttons
type BaseProps = {
  size?: Size;
  color?: Color;
  variant?: Variant;
  loading?: boolean;
  children: ReactNode;
  endIcon?: ReactNode;
  startIcon?: ReactNode;
};
// extract props specific to the motion button
export type ButtonProps<TMotion extends boolean = false> = BaseProps &
  (TMotion extends true
    ? HTMLMotionProps<"button"> & { needsMotion?: true }
    : ButtonHTMLAttributes<HTMLButtonElement> & { needsMotion?: false });
