import { type ReactNode } from "react";

const Code = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <span
      className={`inline-block text-sm mx-1.5 align-bottom bg-gray-400/50 ring-2 ring-gray-400/80 px-2 py-0.5 rounded-md ${className}`}
    >
      {children}
    </span>
  );
};

export default Code;
