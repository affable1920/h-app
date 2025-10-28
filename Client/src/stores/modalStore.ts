/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Position } from "@/types/ui";
import { create } from "zustand";

interface BaseModalProps {
  [key: string]: unknown;
}

type ModalProps = BaseModalProps extends { viewOverlay?: true }
  ? BaseModalProps & { position?: "center" | "bottom" }
  : BaseModalProps & { position?: Position };

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
}));

export const removeModal = () => useModalStore.setState({ currModal: null });
export default useModalStore;
