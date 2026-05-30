import { Link } from "react-router-dom";
import Code from "../ui/Code";
import { ArrowRight } from "lucide-react";

const HomePage = () => {
  return (
    <section className="flex flex-col h-1/2 text-center items-center gap-2 max-h-full py-12 pb-2">
      <h1>
        In <Code size="sm">Production</Code> Hold on tight
      </h1>

      <div className="flex items-center flex-col mt-4 gap-2">
        <Link
          className="flex items-center gap-1 hover:[&>svg]:translate-x-2 transition-transform duration-200"
          to="chat"
        >
          Check out our AI Assistant
          <ArrowRight size={12} />
        </Link>

        <Link
          to="idx/doctors"
          className="flex items-center gap-1 hover:[&>svg]:translate-x-2 transition-transform duration-200"
        >
          Check directories for now <ArrowRight size={12} />
        </Link>
      </div>
    </section>
  );
};

export default HomePage;
