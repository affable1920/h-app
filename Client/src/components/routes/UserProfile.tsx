import { useState } from "react";
import { DateTime } from "luxon";

import Spinner from "../Spinner";
import Button from "../ui/Button";

import { useProfile } from "@/hooks/auth";
import useModalStore from "@/stores/modalStore";

import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, ArrowRightIcon } from "lucide-react";
import Code from "../ui/Code";

const UserProfile = () => {
  const [view, setView] = useState(false);
  const { data: profile, isError, isPending } = useProfile();

  const openModal = useModalStore((s) => s.openModal);

  if (isError) {
    return (
      <div>
        <h2 className="capitalize tracking-widest truncate">
          error fetching your <Code>profile</Code>. please try later ...
        </h2>
      </div>
    );
  }

  const hasBookings = !!profile?.appointments?.length;

  console.log(profile);

  return (
    <div>
      <Code className="capitalize font-bold text-lg">{profile?.username}</Code>

      {hasBookings && (
        <div className="flex items-center gap-2">
          <h2 className="card-h2 first-letter:capitalize">
            view your appointments
          </h2>
          <motion.button
            animate={{ rotate: view ? 90 : 0 }}
            onClick={setView.bind(null, (p) => !p)}
          >
            <ArrowRight size={12} />
          </motion.button>
        </div>
      )}

      <AnimatePresence mode="wait">
        {view && hasBookings && (
          <motion.section
            className="mt-4"
            initial={{ x: "-70px", opacity: 0 }}
            animate={{
              x: 0,
              y: 0,
              opacity: 1,
              transition: {
                duration: 0.21,
                ease: "easeIn",
              },
            }}
            exit={{ x: "20px", opacity: 0, transition: { duration: 0.1 } }}
          >
            {isPending ? (
              <Spinner />
            ) : (
              <div className="flex flex-col gap-4 mt-2">
                {profile.appointments?.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex flex-col gap-4 bg-slate-100/25 border-2
                       border-slate-300/40 p-4 shadow-md shadow-slate-300/25 rounded-lg"
                  >
                    <header className="flex items-center justify-between">
                      <h2 className="card-h2">
                        {DateTime.fromISO(booking.slot.begin).toFormat(
                          "dd LLL yyyy",
                        )}
                      </h2>
                      <Button size="sm" variant="ghost">
                        <ArrowRightIcon />
                      </Button>
                    </header>

                    <AnimatePresence>
                      <motion.div className="self-end flex flex-col gap-1 items-end">
                        <p className="font-semibold">{booking.slot.begin}</p>
                        {booking.slot.booked && (
                          <Button
                            onClick={openModal.bind(null, "confirmation", {
                              context: booking,
                              tagline: "confirm appointment cancellation ?",
                            })}
                          >
                            cancel appointment
                          </Button>
                        )}
                        {booking.status === "cancelled" && (
                          <p className="capitalize font-black">
                            appointment cancelled
                          </p>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            )}
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserProfile;
