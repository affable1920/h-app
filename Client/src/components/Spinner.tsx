import type { IconSize } from "@/types/button";

const Spinner = ({
  loading = true,
  size = "sm",
}: {
  size?: IconSize;
  loading?: boolean;
}) => {
  if (!loading) return null;
  return <div className={`spinner ${size.toString()}`} />;
};

export default Spinner;
