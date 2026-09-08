import type { Schedule } from "@/types/http";
import { Link, useNavigate } from "react-router-dom";
import { Stack } from "./ui/Stack";
import { Edit, SquareChevronRight, Trash2 } from "lucide-react";
import Button from "./ui/Button";
import { AnimatePresence, motion } from "motion/react";
import Switch from "./ui/Switch";
import { useState } from "react";
import { fromISO } from "@/utils/utils";
import { useDeleteSchedule, useUpdateSchedule } from "@/hooks/use-schedules";
import { toast } from "sonner";
import useModalStore from "@/stores/modal-store";
import Badge from "./ui/Badge";

export function ScheduleComponent({ schedule }: { schedule: Schedule }) {
  const openModal = useModalStore((s) => s.openModal);
  const [showOptions, setShowOptions] = useState(false);

  const { mutateAsync: remove } = useDeleteSchedule();
  const { mutateAsync: update } = useUpdateSchedule();

  const navigate = useNavigate();

  const startTime = fromISO(schedule.start_time).toISOTime({
    precision: "minutes",
    extendedZone: false,
    includeOffset: false,
  });

  const endTime = fromISO(schedule.end_time).toISOTime({
    precision: "minutes",
    extendedZone: false,
    includeOffset: false,
  });

  const wkdays = schedule.weekdays.length;

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
          { id: schedule.id, doctorId: schedule.doctor_id },
          {
            onSuccess() {
              toast.info("Schedule sucessfully deleted.");
            },
            onError(error) {
              if (error.code.toLowerCase() === "schedule_has_appointments") {
                if (!schedule.is_active) {
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
                      doctorId: schedule.doctor_id,
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
    const intendedState = schedule.is_active ? "deactivate" : "activate";

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
        doctorId: schedule.doctor_id,
        id: schedule.id,
        changes: {
          q: "is_active",
          val: !schedule.is_active,
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
      <div className="grow relative group/schedule">
        <Button
          whileHover={{
            scaleX: 1.4,
          }}
          needsMotion={true}
          className="absolute opacity-0 z-999 duration-200 right-0 top-1/2 group-hover/schedule:opacity-100 
          -translate-y-1/2 transition-opacity"
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

        <section className="relative p-4 shadow-md shadow-black/40 bg-layout rounded-xl grow">
          <Badge
            size="xs"
            className="absolute right-2 top-2 z-1 font-semibold p-1! tracking-wide cursor-default!"
            full={false}
            color={schedule.is_active ? "indicator" : "secondary"}
            content={schedule.is_active ? "Active" : "Deactivated"}
          />
          <Stack orientation="V" gap="sm">
            <Stack className="cursor-pointer">
              <Link to={`/view/idx/clinics/${schedule.clinic_id}`}>
                <h1 className="text-md">{schedule.clinic?.name}</h1>
              </Link>
            </Stack>

            <Stack
              align="center"
              justify="between"
              gap={"sm"}
              className="text-text-normal"
            >
              <span>{schedule.clinic?.location}</span>
              <Stack as="span" align="center">
                <span>
                  ( {startTime} - {endTime} )
                </span>
                {wkdays === 7 ? (
                  <span>Mon - Sun</span>
                ) : (
                  <span
                    className="font-bold text-layout bg-white rounded-full inline-block w-4 h-4 
            text-center text-sm"
                  >
                    {wkdays}
                  </span>
                )}
              </Stack>
            </Stack>
          </Stack>
        </section>
      </div>

      <AnimatePresence mode="wait">
        {showOptions && (
          <motion.div
            className="rounded-xl border-2 border-border bg-layout shadow-md shadow-black/40 flex flex-col 
            self-stretch justify-between p-3"
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
                navigate(`/view/doctor/${schedule.doctor_id}/schedule`);
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
              data-tooltip={schedule.is_active ? "deactivate" : "activate"}
            >
              <Switch isOn={schedule.is_active} toggle={handleActivate} />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
