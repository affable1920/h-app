import type { Doctor, Schedule, Slot } from "@/types/http";
import { fromISO } from "@/domain/scheduling/utils";
import { ClinicViewVariants, createStagger } from "@/utils/motion-variants";
import { ArrowRight, ChevronRight, MapPinCheckInside } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import Badge from "@components/ui/Badge";
import useModalStore from "@/stores/modal-store";
import { useSearchParams } from "react-router-dom";
import Button from "@components/ui/Button";

type ScheduleProps = {
  schedule: Schedule;
  doctor: Doctor;
};

type ScheduleState = {
  schedule: ScheduleProps["schedule"];
  slot: Slot | null;
  weekday: number | null;
};

export function AvailabilityScheduleGroup({ schedule, doctor }: ScheduleProps) {
  const openModal = useModalStore((s) => s.openModal);
  const { recurrence, slots = [], clinic } = schedule;

  const [params, setParams] = useSearchParams();
  const dtParam = fromISO(params.get("date") ?? "");

  const [isExpanded, setIsExpanded] = useState(false);

  const [clearDtParam, setClearDtParam] = useState(false);
  const [scheduleState, setScheduleState] = useState<ScheduleState>({
    schedule,
    slot: null,
    weekday: null,
  });

  useEffect(
    function () {
      if (clearDtParam) {
        setParams(function (prev) {
          const next = new URLSearchParams(prev);
          next.delete("date");

          return next;
        });
      }
    },
    [clearDtParam, setParams],
  );

  const update = function <K extends keyof ScheduleState>(
    key: K,
    val: ScheduleState[K],
  ) {
    setScheduleState(function (prev) {
      return {
        ...prev,
        [key]: prev[key] === val ? null : val,
      };
    });
  };

  return (
    <motion.article
      className="bg-layout"
      variants={ClinicViewVariants.articleVariants}
    >
      <header className="space-y-0.5 mb-4">
        <div
          onClick={function () {
            setIsExpanded((p) => !p);
          }}
          role="button"
          className="flex cursor-pointer items-center justify-between"
        >
          <div className="flex items-center gap-6 text-text-normal capitalize ">
            <h2 className="min-w-0 flex-1">{clinic?.name}</h2>
            <Badge as="span" className="shadow-none">
              {recurrence.kind}
            </Badge>
          </div>

          <motion.button
            className="shrink-0"
            initial={false}
            style={{
              cursor: "pointer",
            }}
            animate={{
              rotate: isExpanded ? 90 : 0,
            }}
            aria-label="toggle-button"
            aria-expanded={isExpanded}
            data-tooltip="View slots"
          >
            <ArrowRight size={12} />
          </motion.button>
        </div>

        <div className="flex items-center gap-1 text-text-secondary">
          <p className="text-sm">{clinic?.location}</p>
          <MapPinCheckInside size={10} />
        </div>
      </header>

      {/* <AnimatePresence>
        {isExpanded && (
          <section>
            <motion.div
              initial={{ height: 0 }}
              animate={{
                height: "auto",
              }}
              exit={{ height: 0 }}
            >
              <motion.div
                className="flex items-center flex-wrap gap-4"
                variants={MobileNavVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {recurrence.kind === "one-off"
                  ? recurrence.date
                  : [
                      ...new Set([
                        ...(recurrence.kind === "monthly"
                          ? recurrence.monthDays
                          : recurrence.weekdays),
                      ]),
                    ]
                      .sort((a, b) => a - b)
                      .map(function (day) {
                        return (
                          <motion.button
                            key={day}
                            variants={MobileNavItemVariants}
                          >
                            <Badge
                              style={{
                                paddingInline: "calc(var(--spacing) * 4)",
                                textTransform: "capitalize",
                              }}
                              rounded={false}
                              as="span"
                              onClick={function () {
                                if (dtParam.weekday !== day) {
                                  setClearDtParam(true);
                                }

                                update("weekday", day);
                              }}
                              selected={
                                (scheduleState.weekday || dtParam.weekday) ===
                                day
                              }
                            >
                              {day}
                            </Badge>
                          </motion.button>
                        );
                      })}
              </motion.div>
            </motion.div>
          </section>
        )}
      </AnimatePresence> */}

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="flex flex-col"
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
          >
            {slots.every((s) => s.isBooked) ? (
              <p className="text-center">All slots booked !</p>
            ) : (
              <motion.div
                variants={createStagger({ exitDelay: false }).parent}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex flex-wrap gap-4 justify-center my-6"
              >
                {slots.map(function (slot) {
                  return (
                    <motion.button
                      variants={createStagger().children}
                      className="grow"
                      key={slot.id}
                      onClick={function () {
                        update("slot", slot);
                      }}
                      disabled={slot.isBooked}
                    >
                      <Badge
                        as="span"
                        className="p-2"
                        selected={slot.id === scheduleState.slot?.id}
                        disabled={slot.isBooked}
                      >
                        {
                          fromISO(slot.slotDatetime)
                            ?.toISOTime({
                              precision: "minutes",
                            })
                            ?.split("+")?.[0]
                        }
                      </Badge>
                    </motion.button>
                  );
                })}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {scheduleState.slot &&
          new Set(slots.map((slot: Slot) => slot.id)).has(
            scheduleState.slot.id,
          ) && (
            <motion.div
              key="button-confirm"
              initial={{ height: 0 }}
              animate={{
                height: "auto",
              }}
              exit={{ height: 0, transition: { when: "afterChildren" } }}
              className="flex self-end justify-end overflow-hidden"
            >
              <motion.span
                style={{ zIndex: 0 }}
                initial={{ opacity: 0, x: "30px" }}
                animate={{
                  opacity: 1,
                  x: 0,
                  transition: { ease: "easeOut", duration: 0.2 },
                }}
                exit={{
                  opacity: 0,
                  x: "20px",
                  transition: { ease: "linear", duration: 0.1 },
                }}
              >
                <Button
                  color="white"
                  onClick={function () {
                    openModal("booking-gate", {
                      doctor: doctor,
                      clinic: clinic!,
                      slot: scheduleState.slot!,
                      onSuccess() {
                        setClearDtParam(true);
                        setScheduleState((p) => ({
                          ...p,
                          weekday: null,
                          slot: null,
                        }));
                      },
                    });
                  }}
                  endIcon={<ChevronRight strokeWidth={4} />}
                >
                  book slot
                </Button>
              </motion.span>
            </motion.div>
          )}
      </AnimatePresence>
    </motion.article>
  );
}
