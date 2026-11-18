import { cn } from "@/utils/utils";

type Size = "xs" | "sm" | "md" | "lg";
type Color = "brand" | "white" | "primary" | "indicator";

const sizes = {
  xs: "size-3",
  sm: "size-4",
  md: "size-5",
  lg: "size-7",
} satisfies Record<Size, string>;

const colors = {
  white: "border-white",
  brand: "border-brand",
  indicator: "border-indicator",
  primary: "border-layout",
} satisfies Record<Color, string>;

function Spinner({
  size = "sm",
  color = "white",
}: {
  size?: Size;
  color?: Color;
}) {
  return (
    <div
      className={cn(
        `border-4 rounded-full rotate-360 animate-spin duration-[infinity]`,
        sizes[size],
        colors[color],
        "border-b-transparent",
      )}
    />
  );
}

export default Spinner;
