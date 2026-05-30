import { useState } from "react";
import Spinner from "../Spinner";
import Button from "../ui/Button";
import { useFetchProfile } from "@/hooks/auth";
import useModalStore from "@/stores/modalStore";
import { motion } from "motion/react";
import { RefreshCcw } from "lucide-react";
import Code from "../ui/Code";
import useAuthStore from "@/stores/authStore";
import { Stack } from "../ui/Stack";

const TABS = ["account", "profile"] as const;

function UserProfile() {
  const user = useAuthStore((s) => s.user);

  console.log(user);

  const openModal = useModalStore((s) => s.openModal);
  const closeModal = useModalStore((s) => s.closeModal);

  const { data: profile, isError, isPending, refetch } = useFetchProfile();

  console.log(profile);

  const [currentTab, setCurrentTab] =
    useState<(typeof TABS)[number]>("profile");

  if (isError) {
    return (
      <div>
        <h2 className="capitalize tracking-widest truncate">
          error fetching your <Code>profile</Code>. please try later ...
        </h2>
        <Button
          variant="ghost"
          onClick={function () {
            refetch();
          }}
        >
          Try again <RefreshCcw />
        </Button>
      </div>
    );
  }

  if (isPending) {
    return <Spinner loading />;
  }

  if (!profile) {
    return (
      <div className="font-semibold text-md leading-tight">
        An <em>error</em> occurred while fetching your profile. <br />
        <br />
        We are working on sorting it out. <br />
        Kindly try after sometime.
      </div>
    );
  }

  return (
    <div>
      <Stack
        align="center"
        className="border border-border-vivid rounded-md shadow-md shadow-black/30 
        overflow-hidden w-fit text-sm p-1"
      >
        {TABS.map((tab, i) => {
          return (
            <motion.div
              animate={{
                background:
                  tab === currentTab ? "var(--color-layout-raised)" : "",
                color: tab === currentTab ? "var(--color-text)" : "",
              }}
              className={`capitalize cursor-pointer rounded-md px-3 py-1 font-semibold hover:bg-layout 
                hover:text-text-normal`}
              key={i}
              onClick={function () {
                setCurrentTab(tab);
              }}
            >
              {tab}
            </motion.div>
          );
        })}
      </Stack>
    </div>
  );
}

export default UserProfile;

/**
 * function Patient() {
            return (
              <section>
                {hasBookings && (
                  <div className="flex items-center gap-2 mt-4">
                    <h2 className="card-h2 first-letter:capitalize">
                      view your appointments
                    </h2>
                    <motion.button
                      className="cursor-pointer"
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
                      exit={{
                        x: "20px",
                        opacity: 0,
                        transition: { duration: 0.1 },
                      }}
                    >
                      {isPending ? (
                        <Spinner />
                      ) : (
                        <div className="flex flex-col gap-4 mt-2">
                          {hasBookings &&
                            appointments?.map((booking: Appointment) => (
                              <div
                                key={booking.id}
                                className="flex flex-col gap-4 bg-slate-100/25 border-2
                       border-slate-300/40 p-4 shadow-md shadow-slate-300/25 rounded-lg"
                              >
                                <header className="flex items-center justify-between">
                                  <h2 className="card-h2">
                                    {DateTime.fromISO(
                                      booking.slot.begin,
                                    ).toFormat("dd LLL yyyy")}
                                  </h2>
                                </header>

                                <AnimatePresence>
                                  <motion.div className="self-end space-y-1 text-right">
                                    <p className="font-semibold">
                                      {booking.slot.begin}
                                    </p>
                                    {booking.slot.booked && (
                                      <Button
                                        color="secondary"
                                        onClick={cancel.bind(
                                          null,
                                          booking.id,
                                          booking?.doctorId as string,
                                        )}
                                      >
                                        cancel appointment
                                      </Button>
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
              </section>
            );
          }
 */
