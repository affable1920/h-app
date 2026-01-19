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

// these are props on all buttons

type ColorForVariant<T extends Variant> = T extends "contained"
  ? { variant?: "contained"; color?: Color }
  : { variant?: Exclude<Variant, "contained"> };

type SizeForVariant<T extends Variant> = T extends "icon" ? IconSize : Size;

type IconsForVariant<T extends Variant> = T extends "contained" | "outlined"
  ? {
      startIcon?: ReactNode;
      endIcon?: ReactNode;
    }
  : {
      startIcon?: never;
      endIcon?: never;
    };

export type ButtonProps<TVariant extends Variant = Variant> = {
  size?: SizeForVariant<TVariant>;
  variant?: Variant;
  loading?: boolean;
  color?: ColorForVariant<TVariant>;
} & IconsForVariant<TVariant> &
  ButtonHTMLAttributes<HTMLButtonElement>;
