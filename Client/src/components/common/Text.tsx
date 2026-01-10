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

type TextTypes = Extract<HTMLElementType, "p" | "h1" | "h2" | "h3" | "h4">;

type TextProps<T extends TextTypes = "p"> = {
  as?: T;
  size?: Size;
  bold?: boolean;
  content: string;
} & Omit<React.ComponentPropsWithoutRef<T>, "as">;

const Text = <T extends TextTypes = "p">({
  as,
  size = "md",
  content = "",
  bold = false,
  className = "",
}: TextProps<T>) => {
  const Element = (as || "p") as HTMLElementType;

  const classConfig = useMemo(
    function () {
      return [
        SIZES[size],
        bold ? "font-bold" : "font-semibold",
        "first-letter:capitalize",
        className,
      ]
        .filter(Boolean)
        .join(" ");
    },
    [size, bold, className]
  );

  return <Element className={classConfig}>{content}</Element>;
};

export default Text;
