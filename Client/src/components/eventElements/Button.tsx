import { memo, useMemo } from "react";
import { motion } from "motion/react";
import { VARIANTS, COLORS, SIZES } from "@/types/appButtonTypes";

import type {
  ButtonProps,
  Color,
  Variant,
  Size,
  MotionButtonProps,
} from "@/types/appButtonTypes";

const Button = memo(
  <NeedsMotion extends boolean = false>({
    children,
    startIcon,
    endIcon,
    size = "sm",
    className = "",
    loading = false,
    color = "primary",
    needsMotion = false,
    variant = "contained",
    ...rest
  }: ButtonProps<NeedsMotion>) => {
    const classConfig = useMemo(
      function () {
        const hasColor = variant === "contained" || variant === "badge";
        return [
          "btn",
          SIZES[size as Size],
          VARIANTS[variant as Variant],
          hasColor && COLORS[color as Color],
          loading && "cursor-wait",
          className,
        ]
          .filter(Boolean)
          .join(" ")
          .trim();
      },
      [size, variant, color, loading, className]
    );

    if (needsMotion) {
      return (
        <motion.button className={classConfig} {...(rest as MotionButtonProps)}>
          {startIcon && startIcon}
          {children}
          {endIcon && endIcon}
        </motion.button>
      );
    }

    return (
      <button className={classConfig} {...rest}>
        {startIcon && startIcon}
        {children}
        {endIcon && endIcon}
      </button>
    );
  }
);

export default Button;
Button.displayName = "Button";
