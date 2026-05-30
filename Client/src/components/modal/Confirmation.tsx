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
    <div className="space-y-8 py-4 font-semibold">
      <div
        style={{ lineHeight: 1.2 }}
        className="text-center first-letter:capitalize"
      >
        {tagline}
      </div>
      <div className="flex items-center justify-between px-4">
        <Button variant="ghost" onClick={reject}>
          Decline <X strokeWidth={4} />
        </Button>
        <Button color="secondary" onClick={resolve}>
          Accept <Check strokeWidth={4} />
        </Button>
      </div>
    </div>
  );
}

export default Confirmation;
