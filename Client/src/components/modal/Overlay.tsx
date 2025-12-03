const Overlay = ({
  children,
  viewOverlay = false,
}: {
  viewOverlay: boolean;
  children: React.ReactNode;
}) => {
  return (
    <div
      className={`overlay ${
        viewOverlay ? "flex items-center justify-center" : "bg-transparent"
      }`}
    >
      {children}
    </div>
  );
};

export default Overlay;
