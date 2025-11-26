import { memo, useMemo } from "react";
import { type Color, type Size } from "@/types/button";
import type { ReactNode, ElementType, ComponentPropsWithoutRef } from "react";

interface BaseBadgeProps {
  full?: boolean;
  color?: Color;
  className?: string;
  content?: ReactNode;
  current?: boolean;
  disabled?: boolean;
  selected?: boolean;
  size?: "xs" | Exclude<Size, "xl">;
}

// element type in react represents any valid renderable element
// can be a string like "div", "a" etc or custom react component such as a
// function or class component

type BadgeProps<T extends ElementType = "button"> = BaseBadgeProps & {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, "as" | keyof BaseBadgeProps>;

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
    ...rest
  }: BadgeProps<T>) => {
    const Component = as || "button";

    const classConfig = useMemo(() => {
      return [
        "badge",
        size,
        color,
        current && "current",
        selected && "selected",
        disabled && "disabled",
        full && "w-full",
        className,
      ]
        .filter(Boolean)
        .join(" ");
    }, [current, selected, full, className, size, color, disabled]);

    return (
      <Component className={classConfig} {...rest}>
        {content || children}
      </Component>
    );
  }
);

export default Badge;
Badge.displayName = "Badge";
