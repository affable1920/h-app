import { motion } from "motion/react";
import Spinner from "./Spinner";
import { getClassConfig } from "../../utils/button-styles";
import type { ButtonProps } from "@/types/ui";

function Button<NeedsMotion extends true>(props: ButtonProps<NeedsMotion>) {
  const {
    children,
    disabled = false,
    loading = false,
    className,
    startIcon,
    endIcon,
    needsMotion = false,
    type = "button",
    border = true,
    bg = false,
    ...rest
  } = props;

  if (needsMotion) {
    return (
      <motion.button
        type={type}
        tabIndex={0}
        disabled={disabled || loading}
        className={getClassConfig(props)}
        {...rest}
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
      type={type}
      tabIndex={0}
      disabled={disabled || loading}
      className={getClassConfig(props)}
      {...rest}
    >
      {startIcon && startIcon}
      {children}
      {endIcon && endIcon}
      {loading && <Spinner />}
    </button>
  );
}

export default Button;
Button.displayName = "Button";
