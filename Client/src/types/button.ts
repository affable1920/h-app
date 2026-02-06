/* eslint-disable @typescript-eslint/no-empty-object-type */
import type { ReactNode, ButtonHTMLAttributes } from "react";
export const COLORS = [
  "slate",
  "accent",
  "primary",
  "danger",
  "warning",
  "success",
  "neutral",
] as const;

export const SIZES = ["sm", "md", "lg", "xl"] as const;

export const ICONSIZES = ["xs", "sm", "md", "lg"] as const;
export const VARIANTS = ["icon", "outlined", "contained", "link"] as const;

export type Size = (typeof SIZES)[number];
export type IconSize = (typeof ICONSIZES)[number];

export type Color = (typeof COLORS)[number];
export type Variant = (typeof VARIANTS)[number];

type ButtonBase = {
  loading?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

type ContainedButton = ButtonBase & {
  variant?: "contained";
  color: Color;
  endIcon?: ReactNode;
  startIcon?: ReactNode;
  size?: Size;
};

type OutlinedButton = ButtonBase & {
  variant?: "outlined";
  endIcon?: ReactNode;
  startIcon?: ReactNode;
  size?: Size;
};

type LinkButton = ButtonBase & {
  variant?: "link";
  size?: IconSize;
  to: string;
  endIcon?: ReactNode;
};

type IconButton = ButtonBase & {
  size?: IconSize;
  color?: Color;
  variant?: "icon";
};

export type ButtonProps =
  | ContainedButton
  | OutlinedButton
  | LinkButton
  | IconButton;
