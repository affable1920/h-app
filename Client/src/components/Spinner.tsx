const Spinner = ({ loading }: { loading: boolean }) => {
  if (!loading) return null;

  const spinnerClasses = [
    `w-4 h-4 border-4 rounded-full border-black border-b-accent-dark rotate-[360deg] animate-spin duration-[infinity]`,
  ]
    .filter(Boolean)
    .join(" ");

  console.log(spinnerClasses);

  return <div className={spinnerClasses} />;
};

export default Spinner;
