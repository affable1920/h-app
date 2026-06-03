import type { Size, Color, Variant, ButtonProps } from "@/types/ui";

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 [&>svg]:size-3 text-sm",
  md: "px-6 py-3 [&>svg]:size-4",
  lg: "px-8 py-4 [&>svg]:size-4 text-lg",
};

const iconSizes: Record<Size, string> = {
  sm: "p-0 [&>svg]:size-4",
  md: "p-0 [&>svg]:size-5",
  lg: "p-0 [&>svg]:size-6",
};

const colors: Record<Color, string> = {
  brand: "bg-brand hover:bg-brand-hover text-white shadow-md",
  white: "bg-white text-drk",
  indicator: "bg-indicator text-drk",
  primary: `bg-layout hover:bg-layout-raised border border-border-strong hover:border-border-vivid 
  text-text-secondary hover:text-text`,
};

const variantStyles: Record<Variant, string> = {
  contained: "",
  ghost: `bg-transparent border border-border-strong hover:bg-layout hover:border-border-vivid 
  text-text-secondary hover:shadow-inner hover:shadow-background`,
  icon: ``,
};

export function getClassConfig({ ...props }: ButtonProps): string {
  const base = `font-semibold select-none cursor-pointer transition-colors 
  capitalize inline-flex items-center justify-center rounded-md 
  disabled:opacity-60 disabled:pointer-events-none gap-2 focus:outline-none`;

  const { variant = "contained", size = "sm", className = "" } = props;
  const variantStyle = variantStyles[variant];

  let sizeStyle = variant === "icon" ? iconSizes[size] : sizes[size];

  let colorStyle: string = "";

  if (variant === "contained") {
    colorStyle = colors[(props.color as Color) ?? "primary"];
  }

  if (variant === "icon") {
    colorStyle = `text-text-secondary ${props.disabled ? "text-text-teritiary" : ""}`;
  }

  return [base, colorStyle, variantStyle, sizeStyle, className]
    .filter(Boolean)
    .join(" ")
    .trim();
}
