import type { JSX } from "react";
import Button from "../ui/Button";
import { Check, X } from "lucide-react";

interface ConfirmationProps {
  resolve: () => void;
  reject: () => void;
  tagline: string | JSX.Element;
}

function Confirmation({ resolve, reject, tagline = "" }: ConfirmationProps) {
  return (
    <div className="font-semibold py-6 px-8 space-y-8">
      <div className="text-center first-letter:capitalize">{tagline}</div>
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={reject}>
          Decline <X strokeWidth={4} />
        </Button>
        <Button onClick={resolve} color="white">
          Accept <Check strokeWidth={4} />
        </Button>
      </div>
    </div>
  );
}

export default Confirmation;
