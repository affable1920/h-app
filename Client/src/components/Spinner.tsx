const Spinner = ({ loading }: { loading: boolean }) => {
  if (!loading) return null;

  return (
    <div
      className="w-4 h-4 border-4 rounded-full border-black border-b-accent-dark 
      rotate-[360deg] animate-spin duration-[infinity]"
    />
  );
};

export default Spinner;
