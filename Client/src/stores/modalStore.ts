import { create } from "zustand";

interface ModalStore {
  currModal: string | null;
  openModal: (modal: string) => void;
  closeModal: () => void;
}

const useModalStore = create<ModalStore>((set) => ({
  currModal: null,
  openModal: (modal: string) => set({ currModal: modal }),
  closeModal: () => set({ currModal: null }),
}));

export default useModalStore;
