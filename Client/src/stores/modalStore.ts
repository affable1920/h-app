/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";

type ModalProps = {
  [k: string]: unknown;
  viewOverlay?: boolean;
  position?: "top" | "bottom" | "center";
};

type ModalState = {
  currModal: string | null;
  modalProps: ModalProps;
};

type ModalActions = {
  closeModal: () => void;
  openModal: (modal: string, options?: ModalProps) => void;
};

const useModalStore = create<ModalState & ModalActions>((set, get) => ({
  currModal: null,
  modalProps: {},

  openModal(modal: string, options) {
    set({
      currModal: modal,
      modalProps: options ?? {},
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

export const remove1 = useModalStore.getState().closeModal;
export const remove2 = () => useModalStore.getState().closeModal();
console.log(remove1 === remove2);

export default useModalStore;
