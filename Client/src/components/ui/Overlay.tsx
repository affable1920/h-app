function Overlay({
  children,
  viewOverlay = false,
}: {
  viewOverlay: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999,
        transition: "none",
        background: "rgba(0, 0, 0, 0.35)",
      }}
      className={`${viewOverlay ? "" : "bg-transparent"}`}
    >
      {children}
    </div>
  );
}

export default Overlay;
