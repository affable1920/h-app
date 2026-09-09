import type { MapperProps, Modal } from "@/components/modals/modal-mapper";
import { create } from "zustand";

type Position = "top" | "bottom" | "center" | "left";

type ModalProps = {
  viewOverlay?: boolean;
  position?: Position;
  [k: string]: unknown;
};

type ModalState = {
  currModal: Modal | null;
  modalProps: ModalProps;
};

type ModalActions = {
  closeModal: () => void;
  openModal: <K extends Modal>(
    modal: K,
    options?: ModalProps & MapperProps[K],
  ) => void;
};

const useModalStore = create<ModalState & ModalActions>((set) => ({
  currModal: null,
  modalProps: {},

  openModal(modal, options) {
    set({
      currModal: modal,
      modalProps: { ...(options || {}) },
    });
  },

  closeModal() {
    set({ currModal: null });
  },

  reset() {
    set({ currModal: null, modalProps: {} });
  },
}));

export const removeModal = () => useModalStore.setState({ currModal: null });
export default useModalStore;
