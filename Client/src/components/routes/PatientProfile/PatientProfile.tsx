import { useDeleteAccount, useFetchProfile } from "@/hooks/use-auth";
import ProfileShell from "../../ProfileShell";
import { AnimatePresence, motion } from "motion/react";
import Button from "../../ui/Button";
import { ChevronRight, ChevronUp, Delete, Settings } from "lucide-react";
import { Stack } from "../../ui/Stack";
import { useCallback, useRef, useState } from "react";
import { createStagger } from "@/utils/motion-variants";
import Divider from "../../ui/Divider";
import { fromISO } from "@/utils/utils";
import Badge from "../../ui/Badge";
import { Link } from "react-router-dom";
import { useUnbookingMutation } from "@/features/booking/use-booking";
import useModalStore from "@/stores/modal-store";
import { toast } from "sonner";
import type { APIError, ProfileResponse } from "@/types/http";
import { logout } from "@/stores/auth-store";
import { PageLayout } from "../PageLayout";

const personal = {
  fields: ["username"] as const,
  label: "personal info",
  markup(profile: ProfileResponse<"patient">) {
    if (!profile) {
      return null;
    }

    return (
      <article key={profile.id}>
        <header className="mb-5 italic">Personal Info</header>

        <section className="space-y-4">
          {this.fields.map(function (field) {
            const val = profile?.[field as keyof ProfileResponse<"patient">];

            return (
              typeof val === "string" && (
                <div key={field} className="flex gap-8 items-center">
                  <p className="italic capitalize">{field}</p>
                  <p>{val}</p>
                </div>
              )
            );
          })}
        </section>
      </article>
    );
  },
};

const sections = [personal];

export function PatientProfile() {
  const [show, setShow] = useState(false);
  const openModal = useModalStore((s) => s.openModal);
  const closeModal = useModalStore((s) => s.closeModal);

  const [showSettings, setShowSettings] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const {
    data: profile,
    isError,
    isLoading,
  } = useFetchProfile<"patient">("patient");
  const { mutateAsync: unBook, isPending } = useUnbookingMutation();

  const { mutate: remove } = useDeleteAccount();

  const setTimer = useCallback(function () {
    timerRef.current = setTimeout(function () {
      setShowSettings(false);
    }, 120);
  }, []);

  return (
    <ProfileShell isError={isError} isPending={isLoading}>
      <PageLayout>
        <Stack justify="end" align="center" orientation="V">
          <Button
            onMouseEnter={function () {
              setShowSettings(true);
            }}
            onMouseLeave={setTimer}
            bg={true}
            color="secondary"
            variant="icon"
          >
            <Settings />
          </Button>

          {showSettings && (
            <Button
              className="absolute"
              onMouseEnter={function () {
                if (timerRef.current) {
                  clearTimeout(timerRef.current);
                  timerRef.current = null;
                }
                setShowSettings(true);
              }}
              onMouseLeave={setTimer}
              onClick={function () {
                openModal("confirmation-modal", {
                  onResolve() {
                    remove(profile?.id as string, {
                      onSuccess() {
                        toast("You account was successfully deleted !", {
                          description() {
                            return "logging out ...";
                          },
                        });
                        logout("/");
                      },
                      onError(ex) {
                        console.log(ex);
                        toast.error("Account deletion failed !");
                      },
                      onSettled() {
                        closeModal();
                      },
                    });
                  },
                  tagline: (
                    <>
                      Are you sure you want to delete your account ?<br />
                      This action can not be undone!
                    </>
                  ),
                });
              }}
            >
              Delete account <Delete />
            </Button>
          )}
        </Stack>

        <section className="space-y-6 mt-6">
          {sections.map(function (section) {
            return section.markup(profile!);
          })}

          <Divider />

          <section className="space-y-4">
            <header>
              <h2 className="italic text-text-secondary">Patient Profile</h2>
            </header>

            {!!(profile?.appointments ?? []).length && (
              <motion.button
                animate={{ color: show ? "var(--color-text-normal)" : "" }}
                className="cursor-pointer flex items-center gap-2 text-text-secondary 
              hover:text-text-normal transition-colors duration-200"
                onClick={function () {
                  setShow(function (p) {
                    return !p;
                  });
                }}
              >
                Your Appointments
                <motion.i
                  animate={{
                    rotate: show ? 90 : 0,
                    transition: {
                      duration: 0.125,
                      ease: "circOut",
                    },
                  }}
                >
                  <ChevronRight strokeWidth={4} size={10} />
                </motion.i>
              </motion.button>
            )}

            <AnimatePresence>
              {show && (
                <motion.section
                  variants={createStagger({ exitDelay: true }).parent}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="flex flex-col gap-6 py-6"
                >
                  {(profile?.appointments ?? [])
                    .sort(function (a) {
                      return a.status === "active" ? -1 : 1;
                    })
                    .map(function (appointment) {
                      return (
                        <motion.div
                          key={appointment.id}
                          className="flex flex-col bg-layout p-4 py-3 rounded-lg shadow-black/20 
                          shadow-md border-2 border-border gap-6"
                          variants={createStagger().children}
                        >
                          <Stack justify="between" align="start">
                            <Stack orientation="V" gap={2}>
                              <Link
                                className="font-semibold transition-colors duration-200"
                                to={`/view/doctor/${appointment.doctorId}`}
                              >
                                Dr. {appointment.doctor.name}
                              </Link>

                              <Link to={`/view/clinic/${appointment.clinicId}`}>
                                {appointment.clinic.name}
                              </Link>
                            </Stack>

                            <div>
                              <span className="text-sm inline-flex m-0">
                                {fromISO(appointment.scheduledDate).toFormat(
                                  "dd LLL yyyy",
                                )}
                              </span>
                            </div>
                          </Stack>

                          <Stack align="center" gap={12} className="self-end">
                            {appointment.careJourney?.reasonForVisit && (
                              <Stack
                                gap={4}
                                className="cursor-pointer group/reason"
                              >
                                <motion.span
                                  role="contentinfo"
                                  className="opacity-0 inline-flex text-text-normal 
                                  group-hover/reason:opacity-100 m-0 self-center transition-opacity 
                                  duration-200 mr-2 bg-indicator-hover/40 font-semibold 
                                  p-2 rounded-md py-1 text-sm"
                                >
                                  {appointment.careJourney.reasonForVisit}
                                </motion.span>
                                <Button
                                  className="group-hover/reason:-rotate-90"
                                  needsMotion={true}
                                  variant="icon"
                                >
                                  <ChevronUp strokeWidth={4} />
                                </Button>
                              </Stack>
                            )}

                            <Stack align="end" gap={4}>
                              <Badge
                                className="capitalize font-semibold scale-90 cursor-default!"
                                color={
                                  appointment.status === "active"
                                    ? "indicator"
                                    : "secondary"
                                }
                                disabled={appointment.status !== "active"}
                              >
                                {appointment.status}
                              </Badge>

                              {appointment.status === "active" && (
                                <Button
                                  loading={isPending}
                                  onClick={function () {
                                    openModal("confirmation-modal", {
                                      tagline: (
                                        <span>
                                          <p className="leading-1.2 mb-3">
                                            Are you sure you want to cancel your
                                            appointment ?
                                          </p>
                                          <Badge
                                            color="danger"
                                            style={{
                                              fontWeight: 800,
                                              color: "white",
                                              fontFamily: "monospace",
                                            }}
                                          >
                                            This step can not be undone !
                                          </Badge>
                                        </span>
                                      ),
                                      onResolve: async function () {
                                        unBook(
                                          {
                                            appointmentId: appointment.id,
                                            doctorId: appointment.doctorId,
                                          },
                                          {
                                            onSuccess() {
                                              toast.message(
                                                "Appointment successfully cancelled.",
                                              );
                                              closeModal();
                                            },
                                            onError(error) {
                                              const resolved =
                                                error as unknown as APIError;

                                              toast(resolved.code, {
                                                description() {
                                                  return resolved.message;
                                                },
                                              });
                                            },
                                          },
                                        );
                                      },
                                      reject: closeModal,
                                    });
                                  }}
                                  color="brand"
                                >
                                  Cancel
                                </Button>
                              )}
                            </Stack>
                          </Stack>
                        </motion.div>
                      );
                    })}
                </motion.section>
              )}
            </AnimatePresence>
          </section>
        </section>
      </PageLayout>
    </ProfileShell>
  );
}
