import { useEffect, type JSX } from "react";
import Button from "../ui/Button";
import { ChevronRight, X } from "lucide-react";
import { removeModal } from "@/stores/modal-store";

interface ConfirmationProps {
  resolve: () => void;
  reject: () => void;
  tagline: string | JSX.Element;
  autoClose?: boolean;
  timeout?: number;
}

function Confirmation({
  resolve,
  reject,
  tagline = "",
  autoClose = false,
  timeout = 3000,
}: ConfirmationProps) {
  useEffect(function () {
    if (autoClose)
      setTimeout(function () {
        removeModal();
      }, timeout);
  }, []);

  return (
    <div className="font-semibold py-6 px-8 space-y-8">
      <div className="text-center first-letter:capitalize">{tagline}</div>
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={function () {
            reject?.();
            removeModal();
          }}
        >
          Decline <X strokeWidth={4} />
        </Button>
        <Button onClick={resolve} color="white">
          Accept <ChevronRight strokeWidth={4} />
        </Button>
      </div>
    </div>
  );
}

export default Confirmation;
