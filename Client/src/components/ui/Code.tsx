import { type ReactNode } from "react";

const colors = {
  primary: "bg-primary text-white",
  secondary: `bg-secondary text-slate-50`,
  slate: "bg-slate-200/40 text-black",
} as const;

const sizes = {
  sm: "py-1 px-2",
  md: "py-2 px-3",
  lg: "py-4 px-4",
};

interface Props {
  children: ReactNode;
  className?: string;
  size?: keyof typeof sizes;
  color?: keyof typeof colors;
}

const Code = ({
  children,
  className,
  size = "sm",
  color = "secondary",
}: Props) => {
  const config = [
    `inline-block align-bottom rounded-lg`,
    colors[color],
    sizes[size],
    className,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return <span className={`${config}`}>{children}</span>;
};

export default Code;
