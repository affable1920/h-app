import { memo, useMemo } from "react";

import Spinner from "../Spinner";
import { getClassConfig } from "./ButtonStylesConfig";
import type { ButtonProps } from "@/types/button";

const Button = memo((props: ButtonProps) => {
  const classConfig = useMemo(() => getClassConfig(props), [{ ...props }]);

  const {
    children,
    disabled = false,
    loading = false,
    className,
    startIcon,
    endIcon,
    ...rest
  } = props;

  return (
    <button
      disabled={disabled || loading}
      className={`${classConfig} ${className}`}
      {...rest}
    >
      {startIcon && startIcon}
      {children}
      {endIcon && endIcon}
      {loading && <Spinner />}
    </button>
  );
});

export default Button;
Button.displayName = "Button";
