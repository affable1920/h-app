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

  openModal: (modal: string, options) => {
    set({ currModal: modal, modalProps: options ?? get().modalProps });
  },

  closeModal: () => set({ currModal: null }),

  reset: () => {
    set({ currModal: null, modalProps: {} });
  },
}));

export const removeModal = () => useModalStore.setState({ currModal: null });
export default useModalStore;
