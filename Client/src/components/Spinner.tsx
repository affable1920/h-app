import type { IconSize } from "@/types/button";

const sizes: Record<IconSize, string> = {
  xs: "size-3",
  sm: "size-5",
  md: "size-6",
  lg: "size-8",
};

const Spinner = ({
  loading = true,
  size = "sm",
}: {
  size?: IconSize;
  loading?: boolean;
}) => {
  if (!loading) return null;

  return (
    <div
      className={`border-4 rounded-full border-secondary border-b-accent-dark rotate-360 animate-spin 
    duration-[infinity] ${sizes[size]}`}
    />
  );
};

export default Spinner;
