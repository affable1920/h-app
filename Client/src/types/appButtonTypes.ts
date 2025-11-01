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

export type IconSize = {
  [K in keyof typeof SIZES]: `text-${(typeof SIZES)[K]}`;
};

export type Color = keyof typeof COLORS;
export type Variant = keyof typeof VARIANTS;

interface BaseButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  color?: Color;
  loading?: boolean;
  children: ReactNode;
  endIcon?: ReactNode;
  startIcon?: ReactNode;
  needsMotion?: boolean;
}

type IconButtonProps = { variant?: "icon"; size: IconSize };

type RegularButtonprops = {
  variant?: "contained" | "outlined" | "badge";
  size?: Size;
};

export type MotionButtonProps = React.ComponentProps<typeof motion.button>;

export type ButtonProps<NeedsMotion extends boolean = false> = BaseButtonProps &
  (IconButtonProps | RegularButtonprops) &
  (NeedsMotion extends true ? MotionButtonProps : {});
