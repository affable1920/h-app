/* eslint-disable @typescript-eslint/no-empty-object-type */
import type { motion } from "motion/react";
import type React from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

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
  badge: "badge",
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

interface BaseButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: Size;
  color?: Color;
  variant?: Variant;
  loading?: boolean;
  children: ReactNode;
  endIcon?: ReactNode;
  startIcon?: ReactNode;
  needsMotion?: boolean;
}

export type MotionButtonProps = React.ComponentProps<typeof motion.button>;

export type ButtonProps<NeedsMotion extends boolean = false> = BaseButtonProps &
  (NeedsMotion extends true ? MotionButtonProps : {});
