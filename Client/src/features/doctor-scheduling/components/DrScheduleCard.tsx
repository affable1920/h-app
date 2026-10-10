import { Link } from "react-router-dom";
import { Eye, SquareChevronRight, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useDeleteSchedule,
  useSetScheduleActivation,
} from "@/features/doctor-scheduling/api/mutations";
import type { APIError, Doctor } from "@/types/http";
import useModalStore from "@/stores/modal-store";
import type { DoctorSchedule } from "@/types/models";
import { fromISO, getWeekday } from "@/domain/scheduling/utils";

import { Stack } from "@components/ui/Stack";
import Button from "@/components/lib/button/Button";
import { Switch } from "@components/ui/Switch";
import Badge from "@components/ui/Badge";
import Card from "@components/ui/Card";

export function DrScheduleCard({
  doctor,
  schedule,
}: {
  doctor: Doctor;
  schedule: DoctorSchedule;
}) {
  const openModal = useModalStore((s) => s.openModal);

  const [showOptions, setShowOptions] = useState(false);

  const { mutateAsync: removeSchedule } = useDeleteSchedule();
  const { mutateAsync: updateSchedule } = useSetScheduleActivation();

  const st = fromISO(schedule.startTime).toFormat("HH:mm");
  const et = fromISO(schedule.endTime).toFormat("HH:mm");

  const recurrence = schedule.recurrence;

  async function handleDelete() {
    try {
      await new Promise<void>(function (resolve, reject) {
        openModal("confirmation-modal", {
          tagline: (
            <>
              Are you sure you want to delete your schedule ? <br />
              <span className="inline-flex m-0 text-red-800 mt-1">
                This step cannot be undone
              </span>
            </>
          ),
          onResolve: function () {
            resolve();
          },
          onReject() {
            reject();
          },
        });
      });
    } catch {
      return;
    }

    try {
      await removeSchedule({ id: schedule.id, doctorId: doctor.id });
      toast.info("You schedule was sucessfully deleted.");
    } catch (ex) {
      const error = ex as APIError;
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
                Would you rather like to <em>deactivate</em> your schedule ?
              </p>
            </>
          ),
          onResolve: async function () {
            await updateSchedule({
              doctorId: doctor.id,
              id: schedule.id,
              isActive: false,
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
    }
  }

  async function handleActivate() {
    const next = schedule.isActive === true ? false : true;

    if (!next) {
      try {
        await new Promise<void>(function (res, rej) {
          openModal("confirmation-modal", {
            tagline: "Are you sure you want to deactivate your schedule ?",
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

    await updateSchedule(
      {
        doctorId: doctor.id,
        id: schedule.id,
        isActive: next,
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
      className="flex items-stretch"
    >
      <Card className="relative group/schedule self-stretch grow border-border">
        <div>
          <Card.Header>
            <Stack justify="between" align="start">
              <Stack orientation="V" gap={2}>
                <Link to={`/view/idx/clinics/${schedule.clinic?.id}`}>
                  <Card.Title>{schedule.clinic?.name}</Card.Title>
                </Link>

                <Card.Description>{schedule.clinic?.location}</Card.Description>
              </Stack>

              <Badge
                as="span"
                size="xs"
                className="font-semibold p-1! tracking-wide cursor-default!"
                color={schedule.isActive ? "indicator" : "secondary"}
              >
                {schedule.isActive ? "Active" : "Paused"}
              </Badge>
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
        </div>

        <div className="flex justify-between items-end gap-2">
          <Stack className="[&_span]:text-sm" align="center">
            <span>{st}</span> - <span>{et}</span>
          </Stack>
          <Stack>
            {recurrence.kind === "one-off" ? (
              <Badge as="span">{recurrence.date}</Badge>
            ) : recurrence.kind === "weekly" ? (
              recurrence.weekdays.length === 7 ? (
                <Badge as="span">Mon - Sun</Badge>
              ) : (
                recurrence.weekdays.map(function (weekday) {
                  return (
                    <Badge as="span" key={weekday}>
                      {getWeekday(weekday).substring(0, 3)}
                    </Badge>
                  );
                })
              )
            ) : (
              recurrence.monthDays.map(function (monthDay) {
                return (
                  <Badge key={monthDay} as="span">
                    {monthDay}
                  </Badge>
                );
              })
            )}

            <Button
              data-tooltip="Preview"
              aria-label="preview-schedule"
              variant="icon"
              bg={true}
            >
              <Eye />
            </Button>
          </Stack>
        </div>
      </Card>

      <AnimatePresence mode="wait">
        {showOptions && (
          <motion.div
            className="flex flex-col bg-layout/20 border border-border-strong rounded-xl p-4 md:p-6
            shadow-md shadow-black/40 justify-between items-center"
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
              onClick={handleDelete}
              data-tooltip="delete"
              aria-label="delete-schedule"
              variant="icon"
              size="sm"
            >
              <Trash2 />
            </Button>
            <div data-tooltip={schedule.isActive ? "Pause" : "Resume"}>
              <Switch
                aria-label={`Active status for ${schedule.clinic.name}`}
                id={`schedule-active-${schedule.id}`}
                value={schedule.isActive}
                onToggle={handleActivate}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
