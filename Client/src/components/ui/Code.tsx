import { type ReactNode } from "react";

const sizes = {
  sm: "py-1 px-2 text-sm",
  md: "py-2 px-3 text-base",
  lg: "py-4 px-4 text-md",
};

interface Props {
  children: ReactNode;
  className?: string;
  size?: keyof typeof sizes;
}

const Code = ({ children, className, size = "sm" }: Props) => {
  const config = [
    `inline-block rounded-lg mx-0.5 bg-layout border border-border text-white`,
    sizes[size],
    className,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return <span className={`${config}`}>{children}</span>;
};

export default Code;
