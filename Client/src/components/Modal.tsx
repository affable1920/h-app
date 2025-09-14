import { createPortal } from "react-dom";
import Button from "./Button";
import { CgClose } from "react-icons/cg";
import useModalStore from "../stores/modalStore";
import type { ElementType } from "react";

const MODALS: Record<string, ElementType> = {
  AIGenerateModal: () => (
    <div>
      <h2>Hello there !</h2>
    </div>
  ),
};

const Modal = () => {
  const portal = document.getElementById("portal");

  const currModal = useModalStore((s) => s.currModal);
  const closeModal = useModalStore((s) => s.closeModal);

  if (!portal) return null;
  if (!currModal) return null;

  const ModalElement = MODALS["AIGenerateModal"];

  return createPortal(
    <div className="overlay">
      {/* Actual modal */}
      <div
        className="modal w-fit max-w-40 bg-white shadow-md p-8 px-6 rounded-md 
      shadow-black/40 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-h-32"
      >
        <Button
          onClick={closeModal}
          color="accent"
          variant="contained"
          className="absolute p-1 right-2 top-2 border-[1px]"
        >
          <CgClose />
        </Button>
        <ModalElement />
      </div>
    </div>,
    portal
  );
};

export default Modal;
