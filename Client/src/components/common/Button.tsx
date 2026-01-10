import { memo, useMemo, type ButtonHTMLAttributes } from "react";

import Spinner from "../Spinner";
import { getClassConfig } from "./ButtonStylesConfig";
import type { ButtonProps, Variant } from "@/types/button";

const Button = memo(
  <TVariant extends Variant>(props: ButtonProps<TVariant>) => {
    const classConfig = useMemo(() => getClassConfig(props), [props]);
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
        {startIcon}
        {children}
        {loading && <Spinner size="xs" />}
        {endIcon}
      </button>
    );
  }
);

export default Button;
Button.displayName = "Button";
