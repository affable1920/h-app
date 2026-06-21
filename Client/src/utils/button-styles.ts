import type { Size, Color, Variant, ButtonProps } from "@/types/ui";

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 [&>svg]:size-3 text-sm",
  md: "px-6 py-3 [&>svg]:size-4",
  lg: "px-8 py-4 [&>svg]:size-4 text-lg",
};

const iconSizes: Record<Size, string> = {
  sm: "[&>svg]:size-3",
  md: "[&>svg]:size-4",
  lg: "[&>svg]:size-5",
};

const borderStyles: Record<Color, string> = {
  primary: `border-2 border-border hover:border-border-strong`,
  brand: `border-2 border-brand-drk`,
  white: `border-2 border-text-normal hover:border-text-secondary`,
  secondary: `border-2 border-border-strong hover:border-border-vivid`,
  indicator: `border-2 border-indicator-drk`,
  danger: `border-2 border-red-700 hover:border-red-600`,
  success: `border-2 border-green-600`,
  warning: `border-2 border-yellow-500 hover:border-yellow-400`,
};

const colors: Record<Color, string> = {
  brand: "bg-brand hover:bg-brand-hover text-white shadow-md",
  white: "bg-text hover:bg-text-normal text-drk",
  indicator: "bg-indicator text-drk hover:bg-indicator-hover",
  primary: `bg-layout hover:bg-layout-raised hover:text-text`,
  secondary: "bg-[#31313e] hover:bg-[#363639] hover:text-text",
  danger: `bg-red-600 hover:bg-red-500 text-drk`,
  success: `bg-green-500 text-drk hover:bg-green-400`,
  warning: `bg-yellow-400 text-drk hover:bg-yellow-300`,
};

const variantStyles: Record<Variant, string> = {
  contained: "",
  ghost: `bg-transparent border-2 border-border-strong hover:bg-layout hover:border-border-vivid 
  text-text-secondary hover:shadow-inner hover:shadow-background`,
  icon: `p-0`,
};

export function getClassConfig({ ...props }: ButtonProps): string {
  const base = `font-semibold select-none cursor-pointer transition-colors duration-200 capitalize inline-flex 
  items-center justify-center rounded-md disabled:opacity-60 disabled:pointer-events-none gap-2 
  focus:outline-none`;

  const {
    border = true,
    variant = "contained",
    size,
    className = "",
    color = "primary",
  } = props;
  const variantStyle = variantStyles[variant];

  let sizeStyle =
    variant === "icon" ? iconSizes[size ?? "md"] : sizes[size ?? "sm"];

  let colorStyle = "";
  let borderStyle = "";

  if (variant === "icon") {
    colorStyle = props.bg
      ? `p-2 rounded-md shadow-sm shadow-black/20 ${colors[color]}`
      : `text-text-secondary ${props.disabled ? "text-text-teritiary" : ""}`;
  }

  if (variant === "contained") {
    colorStyle = colors[color as Color];
    borderStyle = borderStyles[color];
  }

  return [
    base,
    variantStyle,
    colorStyle,
    sizeStyle,
    border && borderStyle,
    className,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
}
