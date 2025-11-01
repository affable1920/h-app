import { memo, useMemo, type ReactNode } from "react";
import ButtonElement from "./Button";

interface BadgeProps {
  content: ReactNode;
  className?: string;
  onClick?: (entity?: unknown) => void;
  isOn?: (entity: unknown) => boolean;
  isDisabled?: (entity: unknown) => boolean;
}

const BadgeComponent = ({
  isOn,
  content,
  onClick,
  isDisabled,
  className,
  ...rest
}: BadgeProps) => {
  const disabled = isDisabled?.(content);

  const classConfig = useMemo(() => {
    return [
      disabled && "badge-disabled",
      isOn?.(content) && "badge-selected",
      className,
    ]
      .filter(Boolean)
      .join(" ");
  }, [content, disabled, isOn, className]);

  return (
    <ButtonElement
      size="md"
      color="slate"
      variant="badge"
      onClick={onClick}
      disabled={disabled}
      className={classConfig}
      {...rest}
    >
      {content}
    </ButtonElement>
  );
};

const Badge = memo(BadgeComponent);

export default Badge;
Badge.displayName = "Badge";
