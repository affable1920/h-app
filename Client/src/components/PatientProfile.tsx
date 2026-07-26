import { useFetchProfile } from "@/hooks/use-auth";
import ProfileShell from "./ProfileShell";
import { AnimatePresence, motion } from "motion/react";
import Button from "./ui/Button";
import { ChevronRight } from "lucide-react";
import { Stack } from "./ui/Stack";
import { useState } from "react";
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

const personal = {
  fields: ["username", "name", "gender", "age"] as const,
  label: "personal info",
  markup(profile: ProfileResponse<"patient">) {
    if (!profile) {
      return null;
    }

    return (
      <article key={profile.id}>
        <header className="mb-5 italic">Personal Info</header>

        <section className="space-y-4">
          {this.fields.map((field) => {
            const val = profile[field] as string;

            return (
              val && (
                <div key={field} className="flex gap-8 items-center ">
                  <p className="italic capitalize">{field}</p>
                  {(val as string) && <p>{val}</p>}
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
  const {
    data: profile,
    isError,
    isLoading,
    refetch,
  } = useFetchProfile("patient");

  const [show, setShow] = useState(false);
  const openModal = useModalStore((s) => s.openModal);
  const closeModal = useModalStore((s) => s.closeModal);

  const { mutateAsync: unBook, isPending } = useUnbookingMutation();

  return (
    <ProfileShell isError={isError} isPending={isLoading} refetch={refetch}>
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div></div>
          <SearchBar clearable val="" onChange={function () {}} />
        </div>
      </header>

      <section className="space-y-6">
        {sections.map((section) => {
          return section.markup(profile!);
        })}

        <Divider />

        <section className="space-y-4">
          <header>
            <h2 className="italic text-text-secondary">Patient Profile</h2>
          </header>

          {!!(profile?.appointments ?? []).length && (
            <Stack
              className="cursor-pointer text-text-secondary hover:text-normal"
              onClick={function () {
                setShow((p) => !p);
              }}
              align="center"
              gap="xs"
            >
              <p>Your Appointments</p>
              <motion.button
                animate={{
                  rotate: show ? 90 : 0,
                  transition: {
                    rotate: {
                      ease: "easeIn",
                      duration: 0.15,
                    },
                  },
                }}
                className="cursor-pointer"
              >
                <ChevronRight strokeWidth={6} size={10} />
              </motion.button>
            </Stack>
          )}

          <AnimatePresence>
            {show && (
              <motion.section
                variants={createStagger({ exitDelay: false }).parent}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex flex-col gap-6 py-6"
              >
                {profile?.appointments.map(function (appointment) {
                  return (
                    <motion.div
                      key={appointment.id}
                      className="flex flex-col justify-between bg-layout p-4 rounded-lg shadow-black/20 shadow-md border-2 border-border"
                      variants={createStagger().children}
                    >
                      <Stack style={{ gap: "4px" }} orientation="V">
                        <Stack justify="between">
                          <Link
                            to={`/view/doctor/${appointment.doctor_id}`}
                            className="text-text-normal hover:text-blue-400 transition-colors
                                duration-150"
                          >
                            Dr. {appointment.doctor.name}
                          </Link>

                          <p className="text-sm">
                            {fromISO(appointment.scheduled_date).toFormat(
                              "dd LLL yyyy",
                            )}
                          </p>
                        </Stack>

                        <Link to={`/view/clinic/${appointment.clinic_id}`}>
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
                                        fontWeight: 700,
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
                                      doctorId: appointment.doctor_id,
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
