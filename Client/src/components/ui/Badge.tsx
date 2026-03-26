import { memo, useMemo } from "react";
import type { ElementType, ReactNode, ComponentPropsWithoutRef } from "react";

import type { Size, COLORS } from "@/types/button";

interface BaseBadgeProps {
  full?: boolean;
  color?: (typeof COLORS)[number] | "slate";
  content?: ReactNode;
  current?: boolean;
  disabled?: boolean;
  selected?: boolean;
  size?: Size;
  rounded?: boolean;
}

// element type in react represents any valid renderable element
// can be a string like "div", "a" etc or custom react component such as a
// function or class component

export type BadgeProps<T extends ElementType = "button"> = BaseBadgeProps & {
  as?: T;
} & ComponentPropsWithoutRef<T>;

const sizes: Record<Size, string> = {
  sm: "text-[0.6rem]",
  md: "text-[0.75rem]",
  lg: "text-[0.9rem]",
};

const Badge = memo(
  <T extends ElementType>({
    as,
    content,
    children,
    className,
    size = "sm",
    full = true,
    color = "slate",
    current = false,
    disabled = false,
    selected = false,
    rounded = true,
    ...rest
  }: BadgeProps<T>) => {
    const Component = as || "button";

    const classConfig = useMemo(
      function () {
        return [
          "badge",
          rounded && "rounded-md",
          sizes[size],
          full && "w-full",
          current &&
            "border-b-2 border-b-accent/50 font-black shadow-inner shadow-accent-dark/60",
          selected && "selected",
          disabled &&
            "cursor-default opacity-70 pointer-events-none shadow-none font-semibold border-none",
          className,
        ]
          .filter(Boolean)
          .join(" ");
      },
      [rounded, size, full, current, selected, className, disabled],
    );

    return (
      <Component className={classConfig} {...rest}>
        {content || children}
      </Component>
    );
  },
);

export default Badge;
Badge.displayName = "Badge";
