import { useEffect, useRef } from "react";
import Button from "../ui/Button";
import { ChevronRight, X } from "lucide-react";
import { removeModal } from "@/stores/modal-store";
import type { ConfirmationProps } from "./modal-mapper";

function Confirmation({
  onResolve,
  onReject,
  tagline = "",
  autoClose = false,
  timeout = 3000,
}: ConfirmationProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    function () {
      if (autoClose) {
        timerRef.current = setTimeout(function () {
          handleReject();
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

  function handleResolve() {
    onResolve();
    removeModal();
  }

  function handleReject() {
    onReject?.();
    removeModal();
  }

  return (
    <div className="font-semibold py-6 px-8 space-y-8">
      <div className="text-center first-letter:capitalize">{tagline}</div>
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={handleReject}>
          Decline <X strokeWidth={4} />
        </Button>
        <Button onClick={handleResolve} color="white">
          Accept <ChevronRight strokeWidth={4} />
        </Button>
      </div>
    </div>
  );
}

export default Confirmation;
