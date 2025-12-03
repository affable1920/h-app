import type { DoctorEssentials } from "@/types/doctorAPI";
import DirectoryFilter from "../filters/DirectoryFilter";
import ScheduleModal from "../ScheduleModal";

const MODALS: Record<string, React.ElementType> = {
  aiGenerateModal: function AIGenerateModal() {
    return (
      <div>
        <h2>Hello there !</h2>
      </div>
    );
  },

  schedule: ScheduleModal,

  directoryFilter: DirectoryFilter,

  call: function Call(dr: DoctorEssentials) {
    return (
      <article>
        <h2 className="card-h2">{dr?.name}</h2>
      </article>
    );
  },

  loginModal() {
    return <div>Login or sign up to continue !</div>;
  },
};

export default MODALS;
