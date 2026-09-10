import type { ElementType } from "react";
import type { Size, Color, BadgeProps } from "@/types/ui";
import { cn } from "@/utils/utils";

const sizes: Record<Size, string> = {
  xs: "text-[8px]",
  sm: "text-xs",
  md: "text-sm",
  lg: "text-md",
};

const colors: Record<Color, string> = {
  brand: "bg-brand hover:bg-brand-hover text-white",
  white: "bg-white text-drk",
  indicator: "bg-indicator text-drk",
  primary: `bg-layout hover:bg-layout-raised text-text-secondary hover:text-text`,
  secondary: `bg-layout-raised hover:bg-text-teritiary/20`,
  danger: `bg-red-400 text-black font-bold`,
  warning: "bg-yellow-500 hover:bg-yellow-400",
  success: "bg-success-500 hover:bg-success-400",
};

const BASE = `inline-flex items-center justify-center transition-colors duration-150 border-2 
  border-border-strong text-center cursor-pointer p-2 capitalize outline-none 
  focus:ring-3 focus:ring-brand/20`;

function Badge<T extends ElementType>({
  as,
  content,
  children,
  className,
  size = "sm",
  full = true,
  color = "secondary",
  current = false,
  disabled = false,
  selected = false,
  rounded = "sm",
  ...rest
}: BadgeProps<T>) {
  const Component = as || "button";
  const props =
    Component === "button" ? { ...rest, type: "button" } : { ...rest };

  return (
    <Component
      className={cn(
        BASE,
        sizes[size],
        !!rounded && "rounded-" + rounded,
        full ? "w-full" : "w-fit",
        colors[color],
        selected &&
          "bg-text hover:bg-text-normal! text-drk font-extrabold border-text",
        disabled &&
          "shadow-none pointer-events-none border-transparent opacity-80 bg-layout-raised/50",
        current && "border-b-2 border-b-brand",
        className,
      )}
      {...props}
    >
      {content || children}
    </Component>
  );
}

export default Badge;
Badge.displayName = "Badge";
