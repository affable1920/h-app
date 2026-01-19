import type { DoctorSummary } from "@/types/doctorAPI";
import DirectoryFilter from "../filters/DirectoryFilter";
import ScheduleModal from "../ScheduleModal";
import { motion } from "motion/react";
import { Heart, LogOut, Bell, User } from "lucide-react";
import Button from "../common/Button";
import authClient from "@/services/Auth";
import { Link, useNavigate } from "react-router-dom";
import useModalStore from "@/stores/modalStore";
import { removeModal } from "@/stores/modalStore";
import useAuthApi from "@/hooks/useAuthApi";
import { toast } from "sonner";

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

  call: function Call(dr: DoctorSummary) {
    return (
      <article>
        <h2 className="card-h2">{dr?.fullname}</h2>
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

  confirmation(props: { tagline: string; context: any }) {
    const {
      unBook: { mutate, isPending },
    } = useAuthApi();

    function cancelBooking() {
      try {
        mutate((props.context as { id: string }).id);
        removeModal();

        toast("appointment successfully cancelled", {
          className: "toast-error",
        });
      } catch {}
    }

    return (
      <div className="flex flex-col items-center gap-8 p-4">
        <h2 className="card-h2 capitalize my-4">{props.tagline}</h2>

        <div className="flex justify-between w-full">
          <Button onClick={removeModal}>no</Button>
          <Button color="danger" loading={isPending} onClick={cancelBooking}>
            confirm
          </Button>
        </div>
      </div>
    );
  },

  authOptions() {
    const navigate = useNavigate();
    const options = ["history", "settings", "view booked appointments"];

    const icons = [
      {
        icon: Heart,
        onClick() {},
        text: "saved for later",
      },
      { icon: Bell, onClick() {}, text: "notifications" },
      {
        icon: User,
        onClick() {
          navigate("/auth/me");
          useModalStore.getState().closeModal();
        },
        text: "profile",
      },
      { icon: LogOut, onClick: authClient.logout, text: "logout" },
    ];

    return (
      <section className="h-full flex flex-col justify-between items-center-safe p-4">
        <motion.ul className="flex flex-col gap-8 [&>li]:first-letter:capitalize items-center">
          {options.map((option) => (
            <motion.li className="font-semibold" key={option}>
              <Link to={`/${option}`}>{option}</Link>
            </motion.li>
          ))}
        </motion.ul>
        <ul className="flex items-center gap-4">
          {icons.map(({ icon: Icon, onClick, text = "" }, i) => (
            <Button
              key={i}
              size="xs"
              variant="icon"
              onClick={onClick}
              data-tooltip={text}
            >
              <Icon />
            </Button>
          ))}
        </ul>
      </section>
    );
  },
};

export default MODALS;
