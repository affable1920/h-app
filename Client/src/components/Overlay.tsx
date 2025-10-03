import { memo } from "react";

const Overlay = memo(
  ({
    children,
    viewOverlay = false,
  }: {
    children: React.ReactNode;
    viewOverlay: boolean;
  }) => {
    return (
      <div
        className={`overlay ${
          viewOverlay ? "flex justify-center items-center" : "bg-transparent"
        }`}
      >
        {children}
      </div>
    );
  }
);

export default Overlay;
