type Size = "sm" | "md" | "lg";
const sizes: Record<Size, string> = {
  sm: "size-4",
  md: "size-6",
  lg: "size-8",
};

const Spinner = ({
  size = "sm",
  loading = true,
}: {
  size?: Size;
  loading?: boolean;
}) => {
  if (!loading) return null;

  return (
    <div
      className={`border-4 rounded-full border-black border-b-secondary-light rotate-360 animate-spin 
    duration-[infinity] ${sizes[size]}`}
    />
  );
};

export default Spinner;
