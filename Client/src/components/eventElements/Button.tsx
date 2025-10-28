import { memo } from "react";
import { motion } from "motion/react";
import {
  VARIANTS,
  COLORS,
  SIZES,
  type ButtonProps,
} from "@/types/appButtonTypes";

const Button = memo(
  ({
    children,
    color,
    size = "sm",
    startIcon,
    endIcon,
    variant,
    loading = false,
    className = "",
    needsMotion,
    ...rest
  }: ButtonProps) => {
    const hasColor = variant === "contained" || variant === "badge";

    const classConfig = [
      "btn",
      SIZES[size],
      VARIANTS[variant],
      hasColor && (COLORS[color] ?? "primary"),
      loading && "cursor-wait",
      className,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

    const ButtonComponent = needsMotion ? motion.button : "button";

    return (
      <ButtonComponent className={classConfig} {...rest}>
        {startIcon && startIcon}
        {children}
        {endIcon && endIcon}
      </ButtonComponent>
    );
  }
);

// Display name for debugging - helpful in React DevTools
Button.displayName = "Button";
export default Button;
