import DirectoryFilter from "@/components/DirectoryFilter";
import ScheduleModal from "../../features/booking/components/ScheduleModal";
import Confirmation from "./Confirmation";
import SearchBar from "../ui/SearchBar";
import DrProfileSetup from "../../features/onboarding-doctor/DrProfileSetup";
import ScheduleCreater from "../ScheduleCreater";
import { Picker } from "../ui/Picker";

const MODALS: Record<string, React.ElementType> = {
  schedule: ScheduleModal,
  search: SearchBar,

  confirmation: Confirmation,

  "create-schedule": ScheduleCreater,

  directoryFilter: DirectoryFilter,
  "doc-profile-setup": DrProfileSetup,
  picker: Picker,
};

export default MODALS;
