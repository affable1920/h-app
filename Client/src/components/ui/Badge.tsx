import type { ComponentPropsWithoutRef, ElementType } from "react";
import type { Size, Color } from "@/components/lib/button/variants";
import { cn } from "@/utils/utils";

const sizes: Record<Size, string> = {
  xs: "px-1 py-1 text-[7.5px]",
  sm: "px-2 py-1.5 text-xs",
  md: "px-3 py-2 text-sm",
  lg: "px-4 py-2 text-md",
};

const colors: Record<Color, string> = {
  brand: "bg-brand text-white",
  white: "bg-white text-drk",
  indicator: "bg-indicator text-drk",
  primary: `bg-layout text-text-secondary`,
  secondary: `bg-layout-raised`,
  danger: `bg-red-400 text-black font-bold`,
  warning: "bg-yellow-500",
  success: "bg-success-500",
};

const hoverClasses: Record<Color, string> = {
  brand: "hover:bg-brand-hover",
  white: "hover:bg-text-normal",
  indicator: "hover:bg-indicator-hover",
  primary: `hover:bg-layout-raised hover:text-text`,
  secondary: `hover:bg-text-teritiary/20`,
  danger: `hover:bg-red-500`,
  warning: "hover:bg-yellow-400",
  success: "hover:bg-success-400",
};

const BASE = `inline-flex items-center justify-center transition-colors duration-150 shadow-sm shadow-black/25 border border-border-vivid text-center p-2 capitalize rounded-md`;

interface BaseBadgeProps {
  size?: Size;
  color?: Color;
  selected?: boolean;
}

export type BadgeProps<T extends ElementType = "span"> = BaseBadgeProps & {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, keyof BaseBadgeProps | "as">;

function Badge<T extends ElementType = "span">({
  as,
  children,
  className,
  size = "sm",
  color = "secondary",
  selected = false,
  ...rest
}: BadgeProps<T>) {
  const Component = as || "span";

  const isInteractive = Component === "button" || Component === "label";

  const styles = cn(
    BASE,
    sizes[size],
    colors[color],
    isInteractive &&
      `${hoverClasses[color]} shadow-md cursor-pointer disabled:opacity-80 disabled:shadow-none disabled:pointer-events-none`,
    selected && "bg-text text-drk font-extrabold border-text",
    selected && isInteractive && "hover:bg-text-normal",
    Component === "button" &&
      "focus-visible:ring-3 focus-visible:ring-brand/20 outline-none",
    className,
  );

  const props =
    Component === "button"
      ? { ...rest, type: rest.type ?? "button" }
      : { ...rest };

  return (
    <Component className={styles} {...props}>
      {children}
    </Component>
  );
}

export default Badge;
Badge.displayName = "Badge";
