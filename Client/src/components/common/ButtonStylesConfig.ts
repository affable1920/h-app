import type {
  Size,
  IconSize,
  Color,
  Variant,
  ButtonProps,
} from "@/types/button";

const standardSizeStyles: Record<Size, string> = {
  sm: "h-6 px-4 py-2",
  md: "h-8 px-8 py-2",
  lg: "h-12 px-10 py-4",
  xl: "h-14 px-12 py-4",
};

const iconSizeStyles: Record<IconSize, string> = {
  xs: "[&>svg]:size-3",
  sm: "[&>svg]:size-4",
  md: "[&>svg]:size-5",
  lg: "[&>svg]:size-6",
};

const linkSizeStyles: Record<IconSize, string> = {
  xs: "text-xs",
  sm: "text-sm",
  md: "text-md",
  lg: "text-lg",
};

const colorStyles: Record<Partial<Color>, { base: string; hover: string }> = {
  primary: {
    base: `bg-secondary border-secondary-dark text-white`,
    hover: `hover:bg-secondary-dark hover:border-black`,
  },
  danger: {
    base: `bg-error-light border-error text-white`,
    hover: `hover:bg-error hover:border-error-dark hover:ring-red-800/10`,
  },
  accent: {
    base: `bg-accent border-accent-dark text-white`,
    hover: `hover:bg-accent-light hover:border-sky-600 hover:ring-accent-dark/10`,
  },
  success: {
    base: `bg-success border-success-dark text-white`,
    hover: `hover:bg-success-dark hover:border-green-800 hover:ring-green-800/10`,
  },
  slate: {
    base: `bg-slate-100 border-slate-300`,
    hover: `bg-slate-200 border-slate-400 ring-slate-800/10`,
  },
  neutral: {
    base: `bg-inherit`,
    hover: `hover:bg-neutral-100 hover:border-neutral-300 hover:ring-neutral-800/10`,
  },
  warning: {
    base: `bg-warning border-warning-dark text-white`,
    hover: `hover:bg-warning-dark hover:border-yellow-800 hover:ring-yellow-800/10`,
  },
};

const variantStyles: Record<Variant, string> = {
  outlined: `bg-transparent border-2 border-secondary hover:bg-secondary hover:border-secondary-dark
    hover:text-white rounded-lg font-bold`,

  contained: `border-2 rounded-lg`,

  icon: "bg-transparent border-none p-0 inline-flex items-center",
  link: "underline underline-offset-2 p-0 border-0 bg-transparent p-0 inline-flex items-center",
};

export function getClassConfig<T extends Variant>({
  ...props
}: ButtonProps<T>): string {
  const base = `tracking-widest leading-tight font-semibold select-none cursor-pointer transition-colors 
  capitalize duration-225 ease-in text-center inline-flex items-center justify-center 
  text-sm disabled:opacity-60 disabled:pointer-events-none [&:has(.spinner)]:gap-1`;

  const { variant = "contained", size = "sm", className = "" } = props;
  const variantStyle = variantStyles[variant];

  let sizeStyle: string;

  if (variant === "icon") {
    sizeStyle = iconSizeStyles[size as IconSize];
  } else if (variant === "link") {
    sizeStyle = linkSizeStyles[size as IconSize];
  } else {
    sizeStyle = standardSizeStyles[size as Size];
  }

  let colorStyle: string = "";

  if (variant === "contained") {
    const { base, hover } = colorStyles[(props.color as Color) ?? "primary"];
    colorStyle = `${base} ${hover}`;
  }

  const extraIconClasses = `[&>svg]:size-3 [&:has(svg)]:gap-2`;

  return [
    base,
    variantStyle,
    sizeStyle,
    variant === "contained" && colorStyle,
    (variant === "contained" || variant === "outlined") && extraIconClasses,
    className,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
}
