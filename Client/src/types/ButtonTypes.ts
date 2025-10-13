import type { MotionProps } from "motion/react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Size = "sm" | "md" | "lg" | "xl";
export type Variant = "contained" | "outlined" | "icon" | "badge";
type Color =
  | "primary"
  | "accent"
  | "danger"
  | "warning"
  | "success"
  | "neutral"
  | "slate";

interface BaseButton extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: Size;
  rounded?: boolean;
  loading?: boolean;
  children: ReactNode;
  endIcon?: ReactNode;
  startIcon?: ReactNode;
}

type BaseButtonProps = BaseButton & { needsMotion?: boolean } & MotionProps;

export type ButtonProps =
  | (BaseButtonProps & { variant: "contained"; color: Color })
  | (BaseButtonProps & { variant: "outlined"; color?: never })
  | (BaseButtonProps & { variant: "icon"; color?: never })
  | (BaseButtonProps & { variant: "badge"; color: Color });
