import DirectoryFilter from "@/components/ui/DirectoryFilter";
import ScheduleModal from "../ScheduleModal";
import Confirmation from "./Confirmation";
import Search from "../Search";
import Sorter from "../ui/Sorter";
import DrProfileSetup from "../../features/onboarding-doctor/DrProfileSetup";

const MODALS: Record<string, React.ElementType> = {
  schedule: ScheduleModal,
  search: Search,

  sorter: Sorter,
  confirmation: Confirmation,

  directoryFilter: DirectoryFilter,
  "doc-profile-setup": DrProfileSetup,
};

export default MODALS;
