import { memo, useMemo } from "react";
import { Link } from "react-router-dom";

import Spinner from "../Spinner";
import { getClassConfig } from "./ButtonStylesConfig";
import type { ButtonProps } from "@/types/button";

const Button = memo((props: ButtonProps) => {
  const classConfig = useMemo(() => getClassConfig(props), [props]);

  const {
    children,
    disabled = false,
    loading = false,
    className,
    ...rest
  } = props;

  if (props.variant === "link") {
    const href = props.to as string;

    return (
      <Link to={href}>
        <button
          disabled={disabled || loading}
          className={`${classConfig} ${className}`}
          {...rest}
        >
          {children}
          {loading && <Spinner size="xs" />}
        </button>
      </Link>
    );
  }

  return (
    <button
      disabled={disabled || loading}
      className={`${classConfig} ${className}`}
      {...rest}
    >
      {children}
      {loading && <Spinner size="xs" />}
    </button>
  );
});

export default Button;
Button.displayName = "Button";
