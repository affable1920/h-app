import DirectoryFilter from "@/components/DirectoryFilter";
import BookingGate from "@/features/booking/components/BookingGate";
import Confirmation from "./Confirmation";
import SearchBar from "../ui/SearchBar";
import DrProfileSetup from "@/features/onboarding-doctor/DrProfileSetup";
import ScheduleForm from "@/features/doctor-scheduling/form/ScheduleForm";
import { Picker } from "../ui/Picker";
import type { Clinic, Doctor, Slot } from "@/types/http";
import type { ReactNode } from "react";
import InformationModal from "./InformationModal";

export type ConfirmationProps = {
  tagline: ReactNode;
  autoClose?: boolean;
  timeout?: number;
  children?: ReactNode;

  onResolve: () => void | Promise<void>;
  onReject?: () => void | Promise<void>;
  onSettled?: () => void | Promise<void>;
};

export type MapperProps = {
  "booking-gate": {
    doctor: Doctor;
    slot: Slot;
    clinic: Clinic;
    onSuccess: () => void;
  };
  "search-bar": {
    query: string;
    context: unknown;
  };
  "confirmation-modal": ConfirmationProps;
  "directory-filter-modal": object;
  "doctor-profile-setup-modal": object;
  "picker-modal": {
    items: Array<unknown>;
    onSelect?: (item: unknown) => void;
    selected?: unknown;
  };
  "schedule-creater-modal": {
    doctor: Doctor;
  };
  "information-modal": {
    children: ReactNode;
  };
};

export type Modal = keyof MapperProps;

type ModalPayload = {
  element: React.ElementType;
  title?: string;
  label: string;
};

const MODAL_MAPPINGS: Record<Modal, ModalPayload> = {
  "booking-gate": {
    element: BookingGate,
    title: "Book an appointment",
    label: "Book an appointment",
  },
  "search-bar": {
    element: SearchBar,
    label: "search",
  },
  "confirmation-modal": {
    element: Confirmation,
    title: "Confirm your action",
    label: "confirm your action",
  },
  "schedule-creater-modal": {
    element: ScheduleForm,
    label: "Create a schedule",
    title: "Create a schedule",
  },
  "directory-filter-modal": {
    element: DirectoryFilter,
    label: "filter directory",
  },
  "doctor-profile-setup-modal": {
    element: DrProfileSetup,
    label: "set up doctor profile",
  },
  "picker-modal": {
    element: Picker,
    label: "choose an option",
  },
  "information-modal": { element: InformationModal, label: "information" },
};

export default MODAL_MAPPINGS;
