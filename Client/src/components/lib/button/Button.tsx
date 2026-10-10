import Spinner from "@components/ui/Spinner";
import { getClassConfig } from "./styles";
import { forwardRef } from "react";
import type { ButtonProps } from "./variants";
import { cn } from "@/utils/utils";

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    children,
    size,
    border,
    bg,
    color,
    variant,
    type = "button",
    loading = false,
    disabled = false,
    className,
    startIcon,
    endIcon,
    ...rest
  }: ButtonProps,
  ref,
) {
  const styles = getClassConfig({
    size,
    color,
    bg,
    border,
    variant,
  });

  return (
    <button
      ref={ref}
      type={type}
      aria-busy={loading}
      disabled={disabled || loading}
      className={cn(
        styles,
        disabled || loading ? "text-text-teritiary" : "cursor-pointer",
        className,
      )}
      {...rest}
    >
      {startIcon && startIcon}
      {children}
      {endIcon && endIcon}
      {loading && <Spinner size={size ?? "sm"} />}
    </button>
  );
});

export default Button;
Button.displayName = "Button";
