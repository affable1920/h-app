import type { DoctorEssentials } from "@/types/doctorAPI";
import DirectoryFilter from "../filters/DirectoryFilter";
import ScheduleModal from "../ScheduleModal";
import { motion } from "motion/react";
import { BiNotification, BiUser } from "react-icons/bi";
import { Heart, LogOut } from "lucide-react";
import Button from "../common/Button";

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

  memberModal() {
    const tagline = "Get onboard to keep track of all your appointments!";

    return (
      <div>
        <h2 className="card-h2">{tagline}</h2>
      </div>
    );
  },

  authOptions({ user }: { user: any }) {
    const options = ["history", "settings", "view booked appointments"];
    return (
      <section className="p-4 flex gap-6 flex-col">
        <motion.ul className="flex items-center flex-wrap gap-8 gap-y-4">
          {options.map((option) => (
            <motion.li
              className="shadow-sm p-2 border-secondary-lightest/25 border-2 rounded-md 
          capitalize font-semibold h-10 px-4 grow cursor-pointer"
              key={option}
            >
              {option}
            </motion.li>
          ))}
        </motion.ul>
        <ul className="flex items-center gap-4 justify-end">
          <Button variant="icon">
            <Heart />
          </Button>
          <Button variant="icon">
            <BiUser />
          </Button>
          <Button variant="icon">
            <LogOut />
          </Button>
          <Button variant="icon">
            <BiNotification />
          </Button>
        </ul>
      </section>
    );
  },
};

export default MODALS;
