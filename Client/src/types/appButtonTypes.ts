import type { MotionProps } from "motion/react";
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

interface BaseButton extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: ReactNode;
  endIcon?: ReactNode;
  startIcon?: ReactNode;
}

type BaseButtonWithSize = BaseButton extends { variant: "icon" }
  ? BaseButton & { size?: IconSize }
  : BaseButton & { size?: Size };

type MotionButton = BaseButtonWithSize & { needsMotion?: true } & MotionProps;

export type ButtonProps =
  | (MotionButton & { variant: "contained"; color: Color })
  | (MotionButton & { variant: "outlined"; color?: never })
  //   This variant of the button is a pure icon without any button props
  | (MotionButton & { variant: "icon"; color?: never })
  | (MotionButton & { variant: "badge"; color: Color });
