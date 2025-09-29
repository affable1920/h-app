import type React from "react";
import type { Doc } from "./doc";

export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface SchedulerProps {
  doctor: Doc;
}

export interface ModalRegistry<> {
  schedule?: React.ReactElement<SchedulerProps>;
}
