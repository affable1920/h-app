import Input from "./ui/Input";
import Button from "./ui/Button";
import { X } from "lucide-react";

export default function Search() {
  return (
    <section>
      <div className="relative p-4 flex items-center">
        <Input
          autoFocus
          id="search"
          name="search"
          type="search"
          placeholder="search"
        />
        <Button
          style={{ position: "absolute", right: "8px" }}
          variant="ghost"
          size="sm"
        >
          <X />
        </Button>
      </div>

      <section></section>
    </section>
  );
}
