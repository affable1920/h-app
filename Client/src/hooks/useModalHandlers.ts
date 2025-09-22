import { useEffect } from "react";
import useModalStore, { removeModal } from "../stores/modalStore";

function useInjectModalHandlers() {
  const currModal = useModalStore((s) => s.currModal);

  useEffect(() => {
    const handleEscape = (ev: KeyboardEvent) => {
      if (currModal && ev.key == "Escape") removeModal();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [currModal]);

  useEffect(() => {
    const handleClick = (ev: MouseEvent) => {
      if (
        currModal &&
        !document.querySelector(".modal")?.contains(ev.target as Node)
      )
        removeModal();
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [currModal]);
}

export default useInjectModalHandlers;
