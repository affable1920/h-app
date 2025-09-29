/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";

type ModalState = {
  currModal: string | null;
  modalProps: Record<string, any>;
};

type ModalActions = {
  closeModal: () => void;
  openModal: (modal: string, options?: Record<string, any>) => void;
};

const useModalStore = create<ModalState & ModalActions>((set, get) => ({
  currModal: null,
  modalProps: {},

  openModal: (modal: string, options) => {
    set({ currModal: modal, modalProps: options ?? get().modalProps });
  },

  closeModal: () => set({ currModal: null }),
}));

export const removeModal = () => useModalStore.setState({ currModal: null });
export default useModalStore;
