import type { ButtonProps } from "@/types/appButtonTypes";
import Button from "./Button";
import { memo, useMemo } from "react";

interface BadgeProps extends ButtonProps {
  isOn?: (entity: unknown) => boolean;
  isCurrent?: (entity: unknown) => boolean;
}

const Badge = memo(
  ({ children, isOn, isCurrent, className, ...rest }: BadgeProps) => {
    const classConfig = useMemo(() => {
      return [
        isCurrent?.(children) && "current",
        isOn?.(children) && "selected",
        className,
      ]
        .filter(Boolean)
        .join(" ");
    }, [children, isOn, isCurrent, className]);

    return (
      <Button variant="badge" className={classConfig} {...rest}>
        {children}
      </Button>
    );
  }
);

export default Badge;
Badge.displayName = "Badge";
