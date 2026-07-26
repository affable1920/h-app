import DirectoryFilter from "@/components/DirectoryFilter";
import ScheduleModal from "../../features/booking/components/ScheduleModal";
import Confirmation from "./Confirmation";
import SearchBar from "../ui/SearchBar";
import DrProfileSetup from "../../features/onboarding-doctor/DrProfileSetup";

const MODALS: Record<string, React.ElementType> = {
  schedule: ScheduleModal,
  search: SearchBar,

  confirmation: Confirmation,

  directoryFilter: DirectoryFilter,
  "doc-profile-setup": DrProfileSetup,
};

export default MODALS;
