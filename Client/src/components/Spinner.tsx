type Size = "xs" | "sm" | "md" | "lg";

interface SpinnerProps {
  size?: Size;
  loading?: boolean;
}

const Spinner = ({ loading = true, size = "sm" }: SpinnerProps) => {
  if (!loading) return null;
  const spinnerClasses = ["spinner", size].filter(Boolean).join(" ").trim();

  return <div className={spinnerClasses} />;
};

export default Spinner;
