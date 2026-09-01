import { useEffect } from "react";
import useModalStore, { removeModal } from "../stores/modal-store";

function useInjectModalHandlers() {
  const currModal = useModalStore((s) => s.currModal);

  useEffect(
    function () {
      function handleEscape(ev: KeyboardEvent) {
        if (ev.key == "Escape") {
          removeModal();
        }
      }

      document.addEventListener("keydown", handleEscape);
      return function () {
        return document.removeEventListener("keydown", handleEscape);
      };
    },
    [currModal],
  );

  useEffect(
    function () {
      function handleClick(ev: MouseEvent) {
        const el = ev.target as Element;

        if (!el.closest("#modal") && !el.closest("#portal")) {
          removeModal();
        }
      }

      document.addEventListener("mousedown", handleClick);
      return function () {
        document.removeEventListener("mousedown", handleClick);
      };
    },
    [currModal],
  );
}

export default useInjectModalHandlers;
