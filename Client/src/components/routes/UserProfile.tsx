import { useState } from "react";
import { DateTime } from "luxon";

import Spinner from "../Spinner";
import Button from "../common/Button";

import { useProfile } from "@/hooks/auth";
import useModalStore from "@/stores/modalStore";

import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, ArrowRightIcon } from "lucide-react";

const UserProfile = () => {
  const [view, setView] = useState(false);
  const { data: profile, isError, isPending } = useProfile();

  if (isError) {
    return (
      <div>
        <h2 className="card-h2 text-xl capitalize text-center tracking-widest truncate">
          error fetching your profile. please try later ...
        </h2>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-lg">{profile?.username}</h2>
      <motion.article className="flex flex-col mt-2">
        <div className="flex items-center gap-2">
          <h2 className="card-h2 first-letter:capitalize">
            view your appointments
          </h2>
          <motion.button
            animate={{ rotate: view ? 90 : 0 }}
            onClick={() => setView((p) => !p)}
          >
            <ArrowRight size={12} />
          </motion.button>
        </div>

        <AnimatePresence mode="wait">
          {view && (
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
                        <Button size="xs" variant="icon">
                          <ArrowRightIcon />
                        </Button>
                      </header>

                      <AnimatePresence>
                        <motion.div className="self-end flex flex-col gap-1 items-end">
                          <p className="font-semibold">{booking.slot.begin}</p>
                          {booking.slot.booked && (
                            <Button
                              color="danger"
                              onClick={() =>
                                useModalStore
                                  .getState()
                                  .openModal("confirmation", {
                                    context: booking,
                                    tagline:
                                      "confirm appointment cancellation ?",
                                  })
                              }
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
      </motion.article>
    </>
  );
};

export default UserProfile;
