/* eslint-disable @typescript-eslint/no-empty-object-type */
import type React from "react";
import type { ButtonHTMLAttributes } from "react";

export const COLORS = ["primary", "secondary", "accent"] as const;
export const SIZES = ["sm", "md", "lg"] as const;
export const VARIANTS = ["ghost", "outlined", "contained"] as const;

export type Size = (typeof SIZES)[number];

export type Color = (typeof COLORS)[number];
export type Variant = (typeof VARIANTS)[number];

type ButtonBase = {
  size?: Size;
  loading?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export type ButtonProps = ButtonBase & {
  color?: Color;
  variant?: Variant;
};
