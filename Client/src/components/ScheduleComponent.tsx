import type { Doctor } from "@/types/http";
import { Link, useNavigate } from "react-router-dom";
import { Stack } from "./ui/Stack";
import { Edit, SquareChevronRight, Trash2 } from "lucide-react";
import Button from "./ui/Button";
import { AnimatePresence, motion } from "motion/react";
import Switch from "./ui/Switch";
import { useState } from "react";
import { useDeleteSchedule, useUpdateSchedule } from "@/hooks/use-schedules";
import { toast } from "sonner";
import useModalStore from "@/stores/modal-store";
import Badge from "./ui/Badge";
import Card from "./ui/Card";
import type { GetDoctorSchedulesResponse } from "@/types/doctor-api";

export function ScheduleComponent({
  doctor,
  schedule,
}: {
  doctor: Doctor;
  schedule: GetDoctorSchedulesResponse;
}) {
  const navigate = useNavigate();
  const openModal = useModalStore((s) => s.openModal);
  const [showOptions, setShowOptions] = useState(false);

  const { mutateAsync: remove } = useDeleteSchedule();
  const { mutateAsync: update } = useUpdateSchedule();

  async function handleDelete() {
    openModal("confirmation-modal", {
      tagline: (
        <>
          Sure you want to delete your schedule ? <br />
          <span className="text-red-800 mt-4">This step cannot be undone</span>
        </>
      ),
      onResolve: async function () {
        await remove(
          { id: schedule.id, doctorId: doctor.id },
          {
            onSuccess() {
              toast.info("Schedule sucessfully deleted.");
            },
            onError(error) {
              if (error.code.toLowerCase() === "schedule_has_appointments") {
                if (!schedule.isActive) {
                  toast.info(error.message, {
                    description() {
                      return "Your schedule is already deactivated !";
                    },
                  });

                  return;
                }

                openModal("confirmation-modal", {
                  tagline: (
                    <>
                      <header className="space-y-2 mb-2">
                        <h1 className="capitalize bg-red-500 p-2 py-1 rounded-sm text-white font-semibold">
                          {error.code.split("_").join(" ")}!
                        </h1>

                        <h2>{error.message}</h2>
                      </header>
                      <p>
                        Would you rather like to <em>deactivate</em> your
                        schedule ?
                      </p>
                    </>
                  ),
                  onResolve: async function () {
                    await update({
                      doctorId: doctor.id,
                      id: schedule.id,
                      changes: {
                        q: "is_active",
                        val: false,
                      },
                    });
                  },
                  onReject() {
                    return;
                  },
                });

                return;
              }

              toast.error(error.code, {
                description() {
                  return error.message;
                },
              });
            },
          },
        );
      },
    });
  }

  async function handleActivate() {
    const intendedState = schedule.isActive ? "deactivate" : "activate";

    if (intendedState === "deactivate") {
      try {
        await new Promise<void>(function (res, rej) {
          openModal("confirmation-modal", {
            tagline: "Sure you want to deactivate your schedule ?",
            onResolve() {
              res();
            },
            onReject() {
              rej();
            },
            autoClose: true,
            timeout: 4000,
          });
        });
      } catch {
        return;
      }
    }

    await update(
      {
        doctorId: doctor.id,
        id: schedule.id,
        changes: {
          q: "is_active",
          val: !schedule.isActive,
        },
      },
      {
        onError(error) {
          toast.error(error.code, {
            description() {
              return error.message;
            },
          });
        },
      },
    );
  }

  return (
    <motion.div
      animate={{
        gap: showOptions ? "calc(var(--spacing) * 3)" : 0,
        transition: {
          ease: "easeIn",
        },
      }}
      className="flex items-center"
      key={schedule.id}
    >
      <Card className="relative group/schedule self-stretch grow border-border">
        <Card.Header>
          <Stack justify="between" align="start">
            <Stack orientation="V" gap={2}>
              <Link to={`/view/idx/clinics/${schedule.clinic?.id}`}>
                <Card.Title>{schedule.clinic?.name}</Card.Title>
              </Link>

              <Card.Description>{schedule.clinic?.location}</Card.Description>
            </Stack>

            <Badge
              size="xs"
              full={false}
              className="font-semibold p-1! tracking-wide cursor-default!"
              color={schedule.isActive ? "indicator" : "secondary"}
              content={schedule.isActive ? "Active" : "Deactivated"}
            />
          </Stack>
        </Card.Header>

        <Button
          className="absolute opacity-0 z-999 right-0 top-1/2 group-hover/schedule:opacity-100 
          -translate-y-1/2 transition-all duration-200 hover:text-text"
          variant="icon"
          size="sm"
          data-tooltip="options"
          aria-label="schedule-options"
          onClick={function () {
            setShowOptions((p) => !p);
          }}
        >
          <SquareChevronRight />
        </Button>
      </Card>

      <AnimatePresence mode="wait">
        {showOptions && (
          <motion.div
            className="flex flex-col bg-layout/20 border border-border-strong rounded-xl p-4 md:p-6 
            space-y-4 shadow-md shadow-black/40"
            key="options"
            layout
            initial={{ width: 0, x: 20, opacity: 0 }}
            animate={{ width: "auto", x: 0, opacity: 1 }}
            exit={{
              width: 0,
              x: 10,
              opacity: 0,
              transition: { duration: 0.15, ease: "linear" },
            }}
          >
            <Button
              aria-label="edit schedule"
              data-tooltip="edit schedule"
              variant="icon"
              size="sm"
              onClick={function () {
                navigate(`/view/doctor/${doctor.id}/schedule`);
              }}
            >
              <Edit />
            </Button>
            <Button
              onClick={handleDelete}
              data-tooltip="delete"
              aria-label="delete-schedule"
              variant="icon"
              size="sm"
            >
              <Trash2 />
            </Button>
            <Button
              variant="icon"
              data-tooltip={schedule.isActive ? "deactivate" : "activate"}
            >
              <Switch isOn={schedule.isActive} toggle={handleActivate} />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
