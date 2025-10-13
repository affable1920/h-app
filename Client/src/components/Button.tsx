import { memo } from "react";
import { motion } from "motion/react";
import { type ButtonProps } from "../types/ButtonTypes";

const variantClasses = {
  icon: "icon",
  badge: "badge",
  outlined: "outlined",
  contained: "contained",
};

const colorClasses = {
  slate: "slate",
  accent: "accent",
  danger: "danger",
  primary: "primary",
  warning: "warning",
  success: "success",
  neutral: "neutral",
};

const Button = memo((props: ButtonProps) => {
  const {
    children,
    color,
    size = "sm",
    startIcon,
    endIcon,
    variant,
    loading = false,
    rounded = false,
    className = "",
    needsMotion = false,
    ...rest // Spread operator captures all other props
  } = props;

  let sizeClasses = {
    sm: "sm",
    md: "md",
    lg: "lg",
    xl: "xl",
  };

  if (variant === "icon")
    sizeClasses = {
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
      xl: "text-xl",
    };

  const hasColor = variant === "contained" || variant === "badge";

  const classConfig = [
    "btn",
    sizeClasses[size],
    variantClasses[variant],
    hasColor && (colorClasses[color] ?? "primary"),
    rounded && "rounded-full",
    loading && "cursor-wait",
    className,
  ]
    .filter(Boolean)
    .join(" ")
    .trim()
    .replace(/\s+/g, " ");

  // Conditionally use motion.button or regular button
  const ButtonComponent = needsMotion ? motion.button : "button";

  return (
    <ButtonComponent
      className={classConfig}
      {...rest} // Spread all other props to the button element
    >
      {startIcon && startIcon}
      {children}
      {endIcon && endIcon}
    </ButtonComponent>
  );
});

// Display name for debugging - helpful in React DevTools
Button.displayName = "Button";
export default Button;
