import { type ReactNode } from "react";

const Emphasize = ({ children }: { children: ReactNode }) => {
  return (
    <span className="inline-block mx-1 align-bottom bg-gray-400/50 ring-2 ring-gray-400/80 px-2 py-0.5 rounded-md">
      {children}
    </span>
  );
};

export default Emphasize;
