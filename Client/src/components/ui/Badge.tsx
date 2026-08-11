import { memo, useMemo } from "react";
import type { ElementType } from "react";

import type { Size, COLORS, BadgeProps } from "@/types/ui";
type Color = (typeof COLORS)[number] | "secondary";

const sizes: Record<Size, string> = {
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
  warning: "",
  success: "",
};

const Badge = memo(
  <T extends ElementType>({
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
  }: BadgeProps<T>) => {
    const Component = as || "button";

    const classConfig = useMemo(
      function () {
        const BASE = `inline-flex items-center justify-center transition-colors duration-150 border-2 
        border-border-strong text-center cursor-pointer p-2 capitalize outline-none 
        focus:ring-3 focus:ring-brand/20`;

        return [
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
        ]
          .filter(Boolean)
          .join(" ");
      },
      [rounded, size, full, color, current, selected, className, disabled],
    );

    const props =
      Component === "button" ? { ...rest, type: "button" } : { ...rest };

    return (
      <Component className={classConfig} {...props}>
        {content || children}
      </Component>
    );
  },
);

export default Badge;
Badge.displayName = "Badge";
