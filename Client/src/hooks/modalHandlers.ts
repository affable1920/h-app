import { useEffect } from "react";
import useModalStore, { removeModal } from "../stores/modalStore";

function useInjectModalHandlers() {
  const currModal = useModalStore((s) => s.currModal);

  useEffect(() => {
    function handleEscape(ev: KeyboardEvent) {
      if (currModal && ev.key == "Escape") removeModal();
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [currModal]);

  useEffect(() => {
    function handleClick(ev: MouseEvent) {
      if (
        currModal &&
        !document.getElementById("modal")?.contains(ev.target as Node)
      )
        removeModal();
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [currModal]);
}

export default useInjectModalHandlers;
