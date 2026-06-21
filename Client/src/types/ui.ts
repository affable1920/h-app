/* eslint-disable @typescript-eslint/no-empty-object-type */
import type { HTMLMotionProps } from "motion/react";
import type {
  ComponentPropsWithoutRef,
  ElementType,
  HTMLAttributes,
  ReactNode,
} from "react";
import type { ButtonHTMLAttributes } from "react";

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

export const SIZES = ["sm", "md", "lg"] as const;
export const VARIANTS = ["ghost", "contained", "icon"] as const;

export type Size = (typeof SIZES)[number];

export type Color = (typeof COLORS)[number];
export type Variant = (typeof VARIANTS)[number];

type ButtonBase = {
  size?: Size;
  loading?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  color?: Color;
  variant?: Variant;
  background?: boolean;
  border?: boolean;
  bg?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export type ButtonProps<NeedsMotion extends true = true> =
  NeedsMotion extends true
    ? HTMLMotionProps<"button"> & ButtonBase & { needsMotion?: true }
    : ButtonBase;

interface BaseBadgeProps {
  full?: boolean;
  color?: Color | "secondary";
  content?: ReactNode;
  current?: boolean;
  disabled?: boolean;
  selected?: boolean;
  size?: Size;
  rounded?: false | "sm" | "md" | "lg";
}

export type BadgeProps<T extends ElementType = "button"> = BaseBadgeProps & {
  as?: T;
} & ComponentPropsWithoutRef<T> &
  HTMLAttributes<T>;
