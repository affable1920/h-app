const Spinner = ({ loading }: { loading: boolean }) => {
  if (!loading) return null;

  return (
    <div className="rotate-[360deg] animate-spin duration-[infinity]">
      Spinner
    </div>
  );
};

export default Spinner;
