import { Link } from "react-router-dom";
import Code from "../ui/Code";
import { ArrowRight } from "lucide-react";
import Button from "../ui/Button";
import { Stack } from "../ui/Stack";

const HomePage = () => {
  return (
    <section className="flex flex-col h-1/2 text-center items-center gap-2 max-h-full py-12 pb-2">
      <h1 className="mb-2">
        In <Code size="sm">Production</Code> Hold on tight
      </h1>

      <Stack align="center">
        <Link
          className="flex items-center gap-1 hover:[&>svg]:translate-x-2 transition-transform duration-200"
          to="chat"
        >
          <Button color="brand" border={false} endIcon={<ArrowRight />}>
            Check out our AI Assistant
          </Button>
        </Link>

        <Link
          to="idx/doctors"
          className="flex items-center gap-1 hover:[&>svg]:translate-x-2 transition-transform duration-200"
        >
          <Button color="white" border={false} endIcon={<ArrowRight />}>
            Check directories for now{" "}
          </Button>
        </Link>
      </Stack>
    </section>
  );
};

export default HomePage;
