import type { Size, Color, Variant, ButtonProps } from "@/types/button";

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 [&>svg]:size-3 text-sm",
  md: "px-6 py-3 [&>svg]:size-4",
  lg: "px-8 py-4 [&>svg]:size-4 text-lg",
};

const ghostSizes: Record<Size, string> = {
  sm: "p-0 [&>svg]:size-4",
  md: "p-0 [&>svg]:size-5",
  lg: "p-0 [&>svg]:size-6",
};

const colors: Record<Color, string> = {
  secondary: `bg-secondary border-secondary-dark text-foreground hover:bg-secondary-dark hover:border-primary hover:text-white`,
  accent: `bg-accent border-accent-dark text-foreground hover:bg-accent-dark`,
  primary: "bg-primary hover:bg-primary-dark",
};

const variantStyles: Record<Variant, string> = {
  outlined: `bg-transparent border-2 border-secondary hover:bg-secondary focus:ring-secondary-dark hover:ring-secondary-dark
    hover:text-foreground`,

  contained: `border-2`,
  ghost: ``,
};

export function getClassConfig({ ...props }: ButtonProps): string {
  const base = `font-semibold select-none cursor-pointer transition-colors 
  capitalize inline-flex items-center justify-center rounded-xl 
  disabled:opacity-60 disabled:pointer-events-none gap-2 focus:outline-none`;

  const { variant = "contained", size = "sm", className = "" } = props;
  const variantStyle = variantStyles[variant];

  let sizeStyle = sizes[size];
  let colorStyle: string;

  if (variant === "ghost") {
    sizeStyle = ghostSizes[size];
    colorStyle = colors[props.color as Color] ?? "";
  }

  colorStyle = colors[props.color as Color] ?? "secondary";

  return [
    base,
    variantStyle,
    sizeStyle,
    ["contained", "ghost"].includes(variant) && colorStyle,
    className,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
}
