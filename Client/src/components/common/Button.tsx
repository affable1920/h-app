import { memo, useMemo, type ButtonHTMLAttributes } from "react";
import { motion, type HTMLMotionProps } from "motion/react";

import Spinner from "../Spinner";
import type { ButtonProps } from "@/types/button";

const Button = memo(
  <NeedsMotion extends boolean = false>(props: ButtonProps<NeedsMotion>) => {
    const {
      children,
      startIcon,
      endIcon,
      size = "sm",
      className = "",
      loading = false,
      disabled = false,
      color = "primary",
      needsMotion = false,
      variant = "contained",
      ...rest
    } = props;

    const classConfig = useMemo(
      function () {
        const hasColor = variant === "contained";

        return [
          "btn",
          size,
          variant,
          hasColor && color,
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
        <motion.button
          className={classConfig}
          disabled={loading || disabled}
          {...(rest as HTMLMotionProps<"button">)}
        >
          {startIcon && startIcon}
          {children}
          {endIcon && endIcon}
          {loading && <Spinner />}
        </motion.button>
      );
    }

    return (
      <button
        className={classConfig}
        disabled={loading || disabled}
        {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {startIcon && startIcon}
        {children}
        {endIcon && endIcon}
        {loading && <Spinner />}
      </button>
    );
  }
);

export default Button;
Button.displayName = "Button";
