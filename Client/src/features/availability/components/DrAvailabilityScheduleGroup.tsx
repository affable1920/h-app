import { useState, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { DateTime } from "luxon";
import { ArrowRight, ChevronRight, MapPinCheckInside } from "lucide-react";

import Badge from "@components/ui/Badge";
import Button from "@/components/lib/button/Button";

import useModalStore from "@/stores/modal-store";
import { ClinicViewVariants, createStagger } from "@/utils/motion-variants";

import type { Doctor, Schedule, Slot } from "@/types/http";

import { areEqual, fromISO } from "@/domain/scheduling/utils";

type ScheduleProps = {
  schedule: Schedule;
  doctor: Doctor;
  selectedDate: DateTime | null;
};

export function AvailabilityScheduleGroup({
  schedule,
  doctor,
  selectedDate,
}: ScheduleProps) {
  const openModal = useModalStore((s) => s.openModal);
  const { recurrence, slots = [], clinic } = schedule;

  const [isExpanded, setIsExpanded] = useState(false);
  const [scheduleState, setScheduleState] = useState<{ slot: Slot | null }>({
    slot: null,
  });

  const slotsForSelectedDate = useMemo(
    function () {
      if (selectedDate === null) {
        return [];
      }

      return slots.filter(function (slot) {
        return areEqual(fromISO(slot.slotDatetime), selectedDate);
      });
    },
    [selectedDate, slots],
  );

  useEffect(
    function () {
      const frame = requestAnimationFrame(function () {
        setScheduleState({ slot: null });
        setIsExpanded(selectedDate !== null && slotsForSelectedDate.length > 0);
      });

      return function () {
        cancelAnimationFrame(frame);
      };
    },
    [selectedDate, slotsForSelectedDate],
  );

  const panelId = `schedule-slots-${schedule.id}`;

  return (
    <motion.article
      className="bg-layout"
      variants={ClinicViewVariants.articleVariants}
    >
      <header className="space-y-0.5 mb-4">
        <div className="flex items-center justify-between">
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
            type="button"
            onClick={function () {
              setIsExpanded((p) => !p);
            }}
            aria-controls={panelId}
            aria-label={
              clinic.name
                ? `Available slots at ${clinic.name}`
                : `Available slots`
            }
            aria-expanded={isExpanded}
            data-tooltip={isExpanded ? "Collapse slots" : "View slots"}
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
          <motion.div
            id={panelId}
            className="flex flex-col"
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
          >
            {selectedDate === null ? (
              <motion.p className="text-center">
                Select an available date to view slots ..
              </motion.p>
            ) : slotsForSelectedDate.length === 0 ? (
              <motion.p className="text-center">
                The schedule has no slots on the selected date ..
              </motion.p>
            ) : slotsForSelectedDate.every((slot) => slot.isBooked) ? (
              <motion.p className="text-center">All slots booked !</motion.p>
            ) : (
              <motion.div
                variants={createStagger({ exitDelay: false }).parent}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex flex-wrap gap-4 my-6"
              >
                {[...slotsForSelectedDate]
                  .sort(function (first, second) {
                    return Number(first.isBooked) - Number(second.isBooked);
                  })
                  .map(function (slot) {
                    const slotTime = fromISO(slot.slotDatetime).toFormat(
                      "HH:mm",
                    );
                    const isSelected = slot.id === scheduleState.slot?.id;

                    return (
                      <motion.span
                        variants={createStagger().children}
                        className="grow"
                        key={slot.id}
                      >
                        <Badge
                          onClick={function () {
                            setScheduleState({ slot });
                          }}
                          as="button"
                          disabled={slot.isBooked}
                          className="p-2 px-3"
                          selected={isSelected}
                          aria-pressed={isSelected}
                          aria-label={`${slotTime} appointment slot ${slot.isBooked ? "booked" : ""}`}
                        >
                          {slotTime}
                        </Badge>
                      </motion.span>
                    );
                  })}
              </motion.div>
            )}
            <AnimatePresence>
              {scheduleState.slot &&
                new Set(slotsForSelectedDate.map((slot) => slot.id)).has(
                  scheduleState.slot.id,
                ) && (
                  <motion.div
                    key="button-confirm"
                    initial={{ height: 0 }}
                    animate={{
                      height: "auto",
                    }}
                    className="flex self-end justify-end overflow-hidden"
                    exit={{ height: 0, transition: { when: "afterChildren" } }}
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
                              setScheduleState({ slot: null });
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
