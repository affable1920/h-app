import DirectoryFilter from "@/components/DirectoryFilter";
import ScheduleModal from "@/features/booking/ScheduleModal";
import Confirmation from "./Confirmation";
import SearchBar from "../ui/SearchBar";
import DrProfileSetup from "@/features/onboarding-doctor/DrProfileSetup";
import ScheduleCreater from "@/features/schedule-create/ScheduleCreater";
import { Picker } from "../ui/Picker";
import type { Clinic, Doctor, Slot } from "@/types/http";
import type { ReactNode } from "react";
import InformationModal from "./InformationModal";

export type ConfirmationProps = {
  tagline: ReactNode;
  onResolve: () => void | Promise<void>;
  onReject?: () => void | Promise<void>;
  onSettled?: () => void | Promise<void>;
  autoClose?: boolean;
  timeout?: number;
};

export type MapperProps = {
  "schedule-modal": {
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

const MODAL_MAPPINGS: Record<Modal, React.ElementType> = {
  "schedule-modal": ScheduleModal,
  "search-bar": SearchBar,
  "confirmation-modal": Confirmation,
  "schedule-creater-modal": ScheduleCreater,
  "directory-filter-modal": DirectoryFilter,
  "doctor-profile-setup-modal": DrProfileSetup,
  "picker-modal": Picker,
  "information-modal": InformationModal,
};

export default MODAL_MAPPINGS;
