import { useEffect, useMemo, useRef } from "react";
import Button from "../lib/button/Button";
import { ChevronRight, X } from "lucide-react";
import { removeModal } from "@/stores/modal-store";
import type { ConfirmationProps } from "./modal-mapper";

function Confirmation({
  onResolve,
  onReject,
  tagline = "",
  autoClose = false,
  timeout = 3000,
  children,
}: ConfirmationProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleReject = useMemo(
    function () {
      return function () {
        onReject?.();
        removeModal();
      };
    },
    [onReject],
  );

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
    [autoClose, timeout, handleReject],
  );

  function handleResolve() {
    onResolve();
    removeModal();
  }

  return (
    <div className="font-semibold py-6 px-8 flex flex-col gap-8">
      <div className="text-center first-letter:capitalize">{tagline}</div>

      {children && <div className="min-w-0 flex-1">{children}</div>}

      <div className="flex items-center justify-between">
        <Button onClick={handleReject}>
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
