import { useFetchProfile, useRemoveAccount } from "@/hooks/use-auth";
import ProfileShell from "./ProfileShell";
import { AnimatePresence, motion } from "motion/react";
import Button from "./ui/Button";
import { ChevronRight, Delete, Settings } from "lucide-react";
import { Stack } from "./ui/Stack";
import { useCallback, useRef, useState } from "react";
import { createStagger } from "@/utils/motion-variants";
import Divider from "./ui/Divider";
import { fromISO } from "@/utils/utils";
import Badge from "./ui/Badge";
import { Link } from "react-router-dom";
import { useUnbookingMutation } from "@/features/booking/use-booking";
import useModalStore from "@/stores/modal-store";
import { toast } from "sonner";
import type { APIError, ProfileResponse } from "@/types/http";
import SearchBar from "./ui/SearchBar";
import { logout } from "@/stores/auth-store";

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

  const remove = useRemoveAccount("patient");

  const setTimer = useCallback(function () {
    timerRef.current = setTimeout(function () {
      setShowSettings(false);
    }, 120);
  }, []);

  return (
    <ProfileShell isError={isError} isPending={isLoading}>
      <Stack gap="sm" align="center" justify="end" className="mb-8 relative">
        <SearchBar clearable val="" onChange={function () {}} />
        <Button
          onClick={function () {
            remove.mutate(profile?.id!, {
              onSuccess() {
                toast("your account was sucessfully deleted.", {
                  className: "capitalize",
                });
                logout("/");
              },
              onError(ex) {
                console.log(ex);
                toast.error("you account could not be deleted", {
                  className: "capitalize",
                });
              },
            });
          }}
          variant="icon"
          bg={true}
          color="secondary"
        >
          <Delete />
        </Button>
      </Stack>

      <section className="space-y-6">
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
                {profile?.appointments
                  .sort(function (a) {
                    return a.status === "active" ? -1 : 1;
                  })
                  .map(function (appointment) {
                    return (
                      <motion.div
                        key={appointment.id}
                        className="flex flex-col justify-between bg-layout p-4 rounded-lg shadow-black/20 shadow-md border-2 border-border"
                        variants={createStagger().children}
                      >
                        <Stack style={{ gap: "4px" }} orientation="V">
                          <Stack justify="between">
                            <Link
                              to={`/view/doctor/${appointment.doctorId}`}
                              className="text-text-normal hover:text-blue-400 transition-colors
                                duration-150"
                            >
                              Dr. {appointment.doctor.name}
                            </Link>

                            <p className="text-sm">
                              {fromISO(appointment.scheduledDate).toFormat(
                                "dd LLL yyyy",
                              )}
                            </p>
                          </Stack>

                          <Link to={`/view/clinic/${appointment.clinicId}`}>
                            {appointment.clinic.name}
                          </Link>
                        </Stack>

                        <div className="flex self-end gap-1">
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
                                openModal("confirmation", {
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
                                  async resolve() {
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

                                          toast(resolved.type, {
                                            description() {
                                              return resolved.msg;
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
                        </div>
                      </motion.div>
                    );
                  })}
              </motion.section>
            )}
          </AnimatePresence>
        </section>
      </section>
    </ProfileShell>
  );
}
