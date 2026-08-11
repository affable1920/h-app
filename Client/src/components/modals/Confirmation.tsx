import { useEffect, useRef, type JSX } from "react";
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
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    function () {
      if (autoClose) {
        timerRef.current = setTimeout(function () {
          removeModal();
        }, timeout);
      }

      return function () {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    },
    [autoClose, timeout],
  );

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
