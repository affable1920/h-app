import { Link } from "react-router-dom";
import Code from "../ui/Code";

const HomePage = () => {
  return (
    <section className="flex flex-col h-1/2 text-center items-center gap-2 max-h-full py-12 pb-2">
      <h1>
        In <Code>Production</Code>, Hold on tight
      </h1>

      <Link
        to="dir/doctors"
        className="underline underline-offset-4 flex items-center gap-2 text-sm hover:bg-accent p-2 
        rounded-lg hover:text-foreground transition-colors"
      >
        <h1>Check directories for now</h1>
      </Link>
    </section>
  );
};

export default HomePage;
