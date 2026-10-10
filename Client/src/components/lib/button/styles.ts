import type {
  Size,
  Color,
  ButtonStyleProps,
} from "@/components/lib/button/variants";

const SIZES: Record<Size, string> = {
  xs: "px-3 py-1 [&>svg]:size-2 text-xs",
  sm: "px-4 py-1.5 [&>svg]:size-3 text-sm",
  md: "px-6 py-2.5 [&>svg]:size-4",
  lg: "px-8 py-3.5 [&>svg]:size-4 text-lg",
};

const ICON_SIZES: Record<Size, string> = {
  xs: "[&>svg]:size-2",
  sm: "[&>svg]:size-3",
  md: "[&>svg]:size-4",
  lg: "[&>svg]:size-5",
};

const BORDER_COLORS: Record<Color, string> = {
  primary: `border-2 border-border hover:border-border-strong`,
  brand: `border-2 border-brand-drk`,
  white: `border-2 border-text-normal hover:border-text-secondary`,
  secondary: `border-2 border-border-vivid hover:border-border-vivid`,
  indicator: `border-2 border-indicator-drk`,
  danger: `border-2 border-red-700 hover:border-red-600`,
  success: `border-2 border-green-600`,
  warning: `border-2 border-yellow-500 hover:border-yellow-400`,
};

const VARIANT_COLORS: Record<Color, string> = {
  brand: "bg-brand hover:bg-brand-hover text-white shadow-md",
  white: "bg-text hover:bg-text-normal text-drk",
  indicator: "bg-indicator text-drk hover:bg-indicator-hover",
  primary: `bg-layout hover:bg-layout-raised hover:text-text`,
  secondary: "bg-[#31313e] hover:bg-[#363639] hover:text-text",
  danger: `bg-red-500 hover:bg-red-600 text-white font-bold`,
  success: `bg-green-500 text-drk hover:bg-green-400`,
  warning: `bg-yellow-400 text-drk hover:bg-yellow-300`,
};

const FOCUS_COLORS: Record<Color, string> = {
  brand: "focus-visible:ring-brand",
  primary: "focus-visible:ring-text-secondary",
  secondary: "focus-visible:ring-text-secondary",
  warning: "focus-visible:ring-yellow-500",
  white: "focus-visible:ring-white",
  danger: "focus-visible:ring-red-500",
  success: "focus-visible:ring-green-500",
  indicator: "focus-visible:ring-indicator",
};

const BASE_STYLES = `font-semibold select-none capitalize inline-flex 
items-center justify-center rounded-md disabled:opacity-60 disabled:pointer-events-none gap-2 
focus:outline-none focus-visible:outline-none focus-visible:ring-3 transition-[background-color,color,border-color,box-shadow]
duration-150 ease-out motion-reduce:transition-none`;

export function getClassConfig({
  size = "sm",
  color = "primary",
  bg,
  border,
  variant = "contained",
}: ButtonStyleProps): string {
  const defaultBorder = border ?? (variant === "icon" ? false : true);
  const sizeStyle = variant === "icon" ? ICON_SIZES[size] : SIZES[size];

  let colorStyle = "";
  let borderStyle = "";

  if (variant === "icon") {
    colorStyle = bg
      ? `p-2 rounded-md shadow-sm shadow-black/20 ${VARIANT_COLORS[color]} ${FOCUS_COLORS[color]}`
      : `text-text-secondary`;
  }

  if (variant === "contained") {
    colorStyle = VARIANT_COLORS[color];
  }

  borderStyle += defaultBorder ? BORDER_COLORS[color] : "";

  return [BASE_STYLES, sizeStyle, colorStyle, FOCUS_COLORS[color], borderStyle]
    .filter(Boolean)
    .join(" ");
}
