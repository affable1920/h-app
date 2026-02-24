import type { DoctorSummary } from "@/types/http";
import DirectoryFilter from "@components/filters/DirectoryFilter";
import ScheduleModal from "../ScheduleModal";
import { motion } from "motion/react";
import { Heart, LogOut, Bell, User } from "lucide-react";
import Button from "../common/Button";
import { Link, useNavigate } from "react-router-dom";
import useModalStore from "@/stores/modalStore";
import { removeModal } from "@/stores/modalStore";
import { toast } from "sonner";
import { useUnbookingMutation } from "@/hooks/bookings";
import useAuthStore from "@/stores/authStore";

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

  confirmation({
    ...props
  }: {
    tagline: string;
    doctorId: string;
    appointmentId: string;
  }) {
    const { mutate: unBook, isPending } = useUnbookingMutation();

    function cancelBooking() {
      unBook(
        {
          doctorId: props.doctorId,
          appointmentId: props.appointmentId,
        },
        {
          successFn() {
            removeModal();
            toast.success("appointment cancelled successfully");
          },
        },
      );
    }

    return (
      <div className="flex flex-col items-center gap-8 p-4">
        <h2 className="card-h2 capitalize my-4">{props.tagline}</h2>

        <div className="flex justify-between w-full">
          <Button onClick={removeModal}>no</Button>
          <Button loading={isPending} onClick={cancelBooking}>
            confirm
          </Button>
        </div>
      </div>
    );
  },

  authOptions() {
    const navigate = useNavigate();
    const options = ["history", "settings", "view booked appointments"];

    const user = useAuthStore((s) => s.user);

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
      { icon: LogOut, onClick() {}, text: "logout" },
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
        {user ? (
          <ul className="flex items-center gap-4">
            {icons.map(({ icon: Icon, onClick, text = "" }, i) => (
              <Button
                key={i}
                variant="ghost"
                onClick={onClick}
                data-tooltip={text}
              >
                <Icon />
              </Button>
            ))}
          </ul>
        ) : (
          <div className="flex items-center gap-4">
            <Button>Sign in</Button>
          </div>
        )}
      </section>
    );
  },
};

export default MODALS;
