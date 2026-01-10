import { memo, useMemo } from "react";
import type { ElementType, ReactNode, ComponentPropsWithoutRef } from "react";

import type { IconSize, Color } from "@/types/button";

interface BaseBadgeProps {
  full?: boolean;
  color?: Color;
  className?: string;
  content?: ReactNode;
  current?: boolean;
  disabled?: boolean;
  selected?: boolean;
  rotate?: boolean;
  size?: IconSize;
}

// element type in react represents any valid renderable element
// can be a string like "div", "a" etc or custom react component such as a
// function or class component

export type BadgeProps<T extends ElementType = "button"> = BaseBadgeProps & {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, "as" | keyof BaseBadgeProps>;

const sizes: Record<IconSize, string> = {
  xs: "p-0",
  sm: "p-1",
  md: "p-2",
  lg: "p-3",
};

const enableRotate = `hover:ring-1 hover:ring-accent/20 hover:rotate-[7.5deg]`;

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
    rotate = false,
    ...rest
  }: BadgeProps<T>) => {
    const Component = as || "button";

    const classConfig = useMemo(() => {
      return [
        "badge",
        sizes[size],
        color,
        current && "current",
        selected && "selected",
        disabled && "disabled",
        full && "w-full",
        rotate && enableRotate,
        className,
      ]
        .filter(Boolean)
        .join(" ");
    }, [current, selected, full, rotate, className, size, color, disabled]);

    return (
      <Component disabled={disabled} className={classConfig} {...rest}>
        {content || children}
      </Component>
    );
  }
);

export default Badge;
Badge.displayName = "Badge";
