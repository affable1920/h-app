import type { Clinic, Schedule, Slot } from "@/types/http";
import { fromISO, getWeekday } from "@/utils/utils";
import {
  ClinicViewVariants,
  MobileNavItemVariants,
  MobileNavVariants,
} from "@/utils/motion-variants";
import { ArrowRight, ClockArrowDown, MapPinCheckInside } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import Badge from "@components/ui/Badge";
import useModalStore from "@stores/modalStore";
import { useSearchParams } from "react-router-dom";
import Button from "@components/ui/Button";

type ScheduleProps = {
  schedule: Schedule;
};

type ScheduleState = {
  schedule: ScheduleProps["schedule"];
  clinic: Clinic | null;
  slot: Slot | null;
  weekday: number | null;
};

export const ScheduleItem = memo(function ({ schedule }: ScheduleProps) {
  const { id, slots, clinic, ...rest } = schedule;
  const [params] = useSearchParams();
  const dtParam = params.get("date");

  const [scheduleState, setScheduleState] = useState<ScheduleState>({
    schedule,
    clinic: null,
    slot: null,
    weekday: null,
  });

  const openModal = useModalStore((s) => s.openModal);
  const [isExpanded, setIsExpanded] = useState(false);

  const validSlots = useMemo(
    function () {
      return slots.every((slot) => slot.is_booked)
        ? []
        : slots.sort((slot) => (slot.is_booked ? 1 : -1));
    },
    [isExpanded, slots],
  );

  const isWkdaySelected = useCallback(
    function (wkday: number) {
      if (!dtParam) {
        return false;
      }
      return fromISO(dtParam)?.weekday === wkday;
    },
    [dtParam],
  );

  useEffect(
    function () {
      if (new Set(rest.weekdays).has(fromISO(dtParam ?? "").weekday)) {
        setIsExpanded(true);
      }
    },
    [dtParam],
  );

  function update<K extends keyof ScheduleState>(
    key: K,
    val: ScheduleState[K],
  ) {
    function updater() {
      setScheduleState(function (prev) {
        return { ...prev, [key]: prev[key] === val ? null : val };
      });
    }

    return updater;
  }

  const isSlotSelected = scheduleState.slot
    ? new Set([...slots.map((s) => s.id)]).has(scheduleState.slot.id)
    : false;

  return (
    <motion.article
      className="bg-layout"
      variants={ClinicViewVariants.articleVariants}
    >
      <header className="space-y-1 mb-6">
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
          <div style={{ willChange: "contents" }}>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              layout
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
                          onClick={update("weekday", wkday)}
                          selected={
                            isWkdaySelected(wkday) ||
                            scheduleState.weekday === wkday
                          }
                          content={getWeekday(wkday).slice(0, 3)}
                        />
                      </motion.button>
                    );
                  })}
              </motion.div>

              <div
                style={{ transitionDuration: "initial" }}
                className="flex flex-col gap-6 mt-6"
              >
                <div className="flex flex-wrap gap-4 justify-center items-center">
                  {!!validSlots.length ? (
                    validSlots.map((slot) => {
                      return isWkdaySelected(
                        fromISO(slot.slot_datetime).weekday,
                      ) ||
                        fromISO(slot.slot_datetime).weekday ===
                          scheduleState.weekday ? (
                        <Badge
                          as="button"
                          key={slot.id}
                          className="flex-1"
                          onClick={update("slot", slot)}
                          selected={slot.id === scheduleState.slot?.id}
                          content={
                            fromISO(slot.slot_datetime)
                              ?.toISOTime({
                                suppressSeconds: true,
                              })
                              ?.split("+")[0] as string
                          }
                          disabled={slot.is_booked}
                        />
                      ) : null;
                    })
                  ) : (
                    <p>All slots booked!</p>
                  )}
                </div>

                {isSlotSelected && (
                  <Button
                    color="white"
                    className="self-end justify-self-end"
                    onClick={function () {
                      openModal("schedule", {
                        doctorId: rest.doctor_id,
                        doctorName: rest.doctor_id,
                        ...scheduleState,
                      });
                    }}
                  >
                    book slot
                    <ClockArrowDown />
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.article>
  );
});
