import {
  useMemo,
  type ComponentPropsWithoutRef,
  type ElementType,
  type LabelHTMLAttributes,
} from "react";

type Size = "sm" | "md" | "lg";

type BaseLabelProps = {
  size?: Size;
  bold?: boolean;
  italic?: boolean;
  color?: "dark" | "light";
  capitalize?: boolean;
};

type LabelProps<T extends ElementType = "p"> = BaseLabelProps & {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, "as" | keyof BaseLabelProps>;

const sizes: Record<Size, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

const Text = <T extends ElementType = "p">({
  as,
  children,
  bold = false,
  size = "sm",
  italic = false,
  color = "dark",
  capitalize = true,
  className,
  ...props
}: LabelProps<T>) => {
  const styles = useMemo(() => {
    return [
      capitalize && "capitalize",
      bold ? "font-bold" : "font-semibold",
      italic && "italic",
      color === "dark" ? "text-secondary" : "text-foreground",
      sizes[size],
      className,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();
  }, [bold, italic, color, size, capitalize, className]);

  if (as === "label") {
    const { htmlFor } = props as LabelHTMLAttributes<HTMLLabelElement>;
    return (
      <label htmlFor={htmlFor} className={styles}>
        {children}
      </label>
    );
  }

  const Component = as ?? "p";
  return <Component className={styles}>{children}</Component>;
};

export default Text;
