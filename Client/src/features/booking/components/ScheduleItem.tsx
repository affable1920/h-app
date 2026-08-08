import type { Doctor, Schedule, Slot } from "@/types/http";
import { fromISO, getWeekday } from "@/utils/utils";
import {
  ClinicViewVariants,
  createStagger,
  MobileNavItemVariants,
  MobileNavVariants,
} from "@/utils/motion-variants";
import { ArrowRight, ChevronRight, MapPinCheckInside } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import Badge from "@components/ui/Badge";
import useModalStore from "@/stores/modal-store";
import { useSearchParams } from "react-router-dom";
import Button from "@components/ui/Button";
import type { DateTimeUnit } from "luxon";

type ScheduleProps = {
  schedule: Schedule;
  doctor: Doctor;
};

type ScheduleState = {
  schedule: ScheduleProps["schedule"];
  slot: Slot | null;
  weekday: number | null;
};

export const ScheduleItem = memo(function ({
  schedule,
  doctor,
}: ScheduleProps) {
  const { id, slots, clinic, ...rest } = schedule;
  const [params, setParams] = useSearchParams();

  const dtParam = fromISO(params.get("date") ?? "");
  const [clearDtParam, setClearDtParam] = useState(false);

  const [scheduleState, setScheduleState] = useState<ScheduleState>({
    schedule,
    slot: null,
    weekday: null,
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const openModal = useModalStore((s) => s.openModal);

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
    [clearDtParam],
  );

  useEffect(
    function () {
      if (schedule.weekdays.includes(dtParam?.weekday)) {
        setIsExpanded(true);
      }
    },
    [dtParam],
  );

  const slotsFiltered = useMemo(
    function () {
      return slots.filter(function (slot) {
        const slotDatetime = fromISO(slot.slot_datetime);

        const checkA = ["month", "day"].every(function (unit) {
          return slotDatetime.hasSame(dtParam, unit as DateTimeUnit);
        });

        // const checkB = slotDatetime.weekday === scheduleState.weekday;

        return checkA;
      });
    },
    [dtParam, slots],
  );

  const showSlots = isExpanded && !!slotsFiltered.length;

  const allBooked = useMemo(
    function () {
      return slotsFiltered.every(function (slot) {
        return slot.is_booked;
      });
    },
    [slotsFiltered],
  );

  const update = useCallback(function <K extends keyof ScheduleState>(
    key: K,
    val: ScheduleState[K],
  ) {
    setScheduleState(function (prev) {
      return { ...prev, [key]: prev[key] === val ? null : val };
    });
  }, []);

  return (
    <motion.article
      className="bg-layout"
      variants={ClinicViewVariants.articleVariants}
    >
      <header className="space-y-1 mb-4">
        <div
          onClick={function () {
            setIsExpanded((p) => !p);
          }}
          className="flex cursor-pointer items-center justify-between"
        >
          <h2 className="text-text-secondary">{clinic?.name}</h2>

          <motion.button
            initial={false}
            style={{
              cursor: "pointer",
            }}
            animate={{
              rotate: isExpanded ? 90 : 0,
            }}
          >
            <ArrowRight size={12} />
          </motion.button>
        </div>

        <div className="flex items-center gap-1 text-text-secondary">
          <p className="text-sm">{clinic?.location}</p>
          <MapPinCheckInside size={10} />
        </div>
      </header>

      <AnimatePresence>
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
                {[...new Set(rest.weekdays)]
                  .sort((a, b) => a - b)
                  .map((wkday) => {
                    return (
                      <motion.button
                        key={wkday}
                        variants={MobileNavItemVariants}
                      >
                        <Badge
                          style={{
                            paddingInline: "calc(var(--spacing) * 4)",
                            textTransform: "capitalize",
                          }}
                          rounded={false}
                          as={"span"}
                          onClick={function () {
                            if (dtParam.weekday !== wkday) {
                              setClearDtParam(true);
                            }

                            update("weekday", wkday);
                          }}
                          selected={
                            (scheduleState.weekday || dtParam.weekday) === wkday
                          }
                          content={getWeekday(wkday).slice(0, 3)}
                        />
                      </motion.button>
                    );
                  })}
              </motion.div>
            </motion.div>
          </section>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSlots && (
          <div className="flex flex-col">
            <motion.div
              className="flex flex-col"
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
            >
              {allBooked ? (
                <p className="text-center">All slots booked !</p>
              ) : (
                <motion.div
                  variants={createStagger({ exitDelay: false }).parent}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="flex flex-wrap gap-4 justify-center my-6"
                  layout
                >
                  {slotsFiltered.map(function (slot) {
                    return (
                      <motion.button
                        variants={createStagger().children}
                        className="flex-1"
                        key={slot.id}
                        onClick={function () {
                          update("slot", slot);
                        }}
                        disabled={slot.is_booked}
                      >
                        <Badge
                          as="span"
                          selected={slot.id === scheduleState.slot?.id}
                          disabled={slot.is_booked}
                        >
                          {
                            fromISO(slot.slot_datetime)
                              ?.toISOTime({ suppressSeconds: true })
                              ?.split("+")?.[0]
                          }
                        </Badge>
                      </motion.button>
                    );
                  })}
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {scheduleState.slot &&
          new Set(slotsFiltered.map((slot) => slot.id)).has(
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
                initial={{ opacity: 0, x: 30 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  transition: { ease: "easeOut", duration: 0.2 },
                }}
                exit={{
                  opacity: 0,
                  x: 20,
                  transition: { ease: "linear", duration: 0.1 },
                }}
              >
                <Button
                  color="white"
                  onClick={function () {
                    openModal("schedule", {
                      doctor,
                      clinic,
                      onSuccess() {
                        setClearDtParam(true);
                        setScheduleState((p) => ({
                          ...p,
                          weekday: null,
                          slot: null,
                        }));
                      },
                      ...scheduleState,
                    });
                  }}
                >
                  book slot
                  <ChevronRight />
                </Button>
              </motion.span>
            </motion.div>
          )}
      </AnimatePresence>
    </motion.article>
  );
});
