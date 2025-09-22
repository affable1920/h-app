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
      <div className={`overlay ${!viewOverlay && "bg-transparent"}`}>
        {children}
      </div>
    );
  }
);

export default Overlay;
