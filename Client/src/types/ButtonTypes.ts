import type { MotionProps } from "motion/react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export type Size = "sm" | "md" | "lg" | "xl";

export type Variant = "contained" | "outlined" | "icon" | "badge";

export type Color =
  | "primary"
  | "accent"
  | "danger"
  | "warning"
  | "success"
  | "neutral"
  | "slate";

interface BaseButton extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: Size;
  loading?: boolean;
  children: ReactNode;
  endIcon?: ReactNode;
  startIcon?: ReactNode;
}

type MotionButton = BaseButton & { needsMotion?: true } & MotionProps;

export type ButtonProps =
  | (MotionButton & { variant: "contained"; color: Color })
  | (MotionButton & { variant: "outlined"; color?: never })
  | (MotionButton & { variant: "icon"; color?: never })
  | (MotionButton & { variant: "badge"; color: Color });
