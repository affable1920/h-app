import { memo, useMemo, type ReactNode } from "react";
import Button from "./Button";

interface BadgeProps<T> {
  entity: T;
  content: ReactNode;
  className?: string;
  onClick?: () => void;
  isOn?: (entity: T) => boolean;
  isDisabled?: (entity: T) => boolean;
}

const BadgeComponent = <T,>({
  isOn,
  entity,
  content,
  onClick,
  isDisabled,
  className,
  ...rest
}: BadgeProps<T>) => {
  const disabled = isDisabled?.(entity);

  const classConfig = useMemo(() => {
    return [
      disabled && "badge-disabled",
      isOn?.(entity) && "badge-selected",
      className,
    ]
      .filter(Boolean)
      .join(" ");
  }, [entity, disabled, isOn, className]);

  return (
    <Button
      size="md"
      color="slate"
      variant="badge"
      onClick={onClick}
      disabled={disabled}
      className={classConfig}
      {...rest}
    >
      {content}
    </Button>
  );
};

const Badge = memo(BadgeComponent);

export default Badge;
Badge.displayName = "Badge";
