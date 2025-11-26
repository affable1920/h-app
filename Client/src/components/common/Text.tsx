/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useMemo } from "react";
import type { HTMLElementType } from "react";

const SIZES = {
  xs: "text-xs",
  sm: "text-sm",
  md: "text-md",
  lg: "text-lg",
} as const;

type Size = keyof typeof SIZES;

type TextProps<T extends HTMLElementType = "p"> = {
  as?: T;
  size?: Size;
  bold?: boolean;
  content: string;
} & Omit<React.ComponentPropsWithoutRef<T>, "as">;

const Text = <T extends HTMLElementType>({
  as,
  size = "md",
  content = "",
  bold = false,
  className = "",
  ...rest
}: TextProps<T>) => {
  const Element = (as || "p") as HTMLElementType;

  const classConfig = useMemo(
    function () {
      return [SIZES[size], bold ? "font-bold" : "font-semibold", className]
        .filter(Boolean)
        .join(" ");
    },
    [size, bold, className]
  );

  return <Element className={classConfig}>{content}</Element>;
};

export default Text;
