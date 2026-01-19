import React, { memo, useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, type Variant } from "motion/react";

import { ArrowRight, MapPinCheckInside } from "lucide-react";

import Button from "./common/Button";
import { ClockArrowDown } from "lucide-react";

import Badge from "./common/Badge";
import { Link } from "react-router-dom";

import { getWeekday } from "@/utils/calendarUtils";
import type { Doctor, Clinic, Schedule } from "../types/doctorAPI";

import useModalStore from "@/stores/modalStore";
import { useSchedule } from "./providers/ScheduleProvider";
import { toast } from "sonner";

const containerVariants: Record<string, Variant> = {
  initial: { opacity: 0, y: -40 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.25,
    },
  },
  exit: {
    y: -40,
    opacity: 0,
  },
};

const articleVariants: Record<string, Variant> = {
  initial: { opacity: 0, x: -20 },
  animate: {
    opacity: 1,
    x: 0,
  },
  exit: { opacity: 0 },
};

interface ClinicsViewProps {
  doctor: Doctor;
  showClinicsView: boolean;
  onShow: (show: boolean) => void;
}

const ClinicsView: React.FC<ClinicsViewProps> = memo(function ({ ...props }) {
  const { doctor, onShow, showClinicsView } = props;
  const { schedules } = doctor;

  const {
    state: scheduleState,
    actions: { clearField, setSlot, setDay, setClinic, setSchedule },
  } = useSchedule();

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const isExpanded = useCallback(
    (id: string) => expandedIds.has(id),
    [expandedIds],
  );

  useEffect(() => {
    // Auto-expand schedules matching selected date
    if (scheduleState.date) {
      const wkday = scheduleState.date.weekday;

      const matchingIds = schedules
        .filter((s) => s.weekdays.includes(wkday))
        .map((s) => s.id!);

      setExpandedIds(new Set(matchingIds));
      onShow(true);
    }
  }, [schedules, onShow, scheduleState.date]);

  const toggleExpansion = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        if (!expandedIds.has(id)) {
          clearField("date");
        }
      }
      return next;
    });
  }, []);

  async function handleBook(schedule: Schedule) {
    if (!scheduleState.date) {
      toast.info("Missing fields.", {
        description() {
          return "Please select a date for your appointment !";
        },
      });

      return;
    }
    setSchedule(schedule);
    useModalStore
      .getState()
      .openModal("schedule", { dr: doctor, viewOverlay: true });
  }

  return (
    <AnimatePresence>
      {showClinicsView && (
        <motion.section
          key={`${doctor.id}-schedule-view`}
          variants={containerVariants}
          transition={{
            duration: 0.25,
            ease: "easeOut",
          }}
          initial="initial"
          animate="animate"
          exit="exit"
          className="box py-4 flex flex-col w-full gap-14 text-sm"
        >
          {schedules.map((schedule) => {
            const {
              id,
              weekdays = [],
              slots = [],
              clinic = {} as Clinic,
            } = (schedule || {}) as Schedule & { clinic?: Clinic };

            return (
              <motion.article
                key={id}
                variants={articleVariants}
                className="schedule-view-box flex flex-col gap-6 "
              >
                <header className="flex justify-between items-center">
                  <div className="flex flex-col gap-0.5">
                    <Link className="flex items-center gap-2 card-h2" to="/">
                      {clinic?.head}
                    </Link>

                    <Link
                      to="/"
                      className={`flex items-center gap-1 text-sm underline underline-offset-2`}
                    >
                      {clinic?.address}
                      <MapPinCheckInside size={8} />
                    </Link>
                  </div>

                  <motion.button
                    initial={false}
                    onClick={() => toggleExpansion(id!)}
                    animate={{
                      rotate: isExpanded(id!) ? 90 : 0,
                    }}
                  >
                    <ArrowRight size={12} />
                  </motion.button>
                </header>

                <AnimatePresence>
                  {isExpanded(id!) && (
                    <motion.div
                      key={id}
                      variants={articleVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="flex flex-col gap-6"
                      transition={{
                        duration: 0.2,
                        ease: "easeOut",
                        opacity: { duration: 0.1 },
                      }}
                    >
                      <article className="flex items-center gap-2">
                        {weekdays.map((wkday) => (
                          <Badge
                            full={false}
                            key={wkday}
                            className="px-4"
                            onClick={() => {
                              setDay(wkday);
                              if (scheduleState?.date?.weekday !== wkday) {
                                clearField("date");
                              }
                            }}
                            selected={scheduleState.day === wkday}
                          >
                            {getWeekday(wkday).slice(0, 3)}
                          </Badge>
                        ))}
                      </article>
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-wrap gap-4 justify-center items-center">
                          {slots.every((slot) => slot.booked) ? (
                            <p className="label text-lg text-error-dark">
                              All slots booked !
                            </p>
                          ) : (
                            slots?.map((slot) => {
                              return (
                                <Badge
                                  as="button"
                                  full={false}
                                  key={slot.id}
                                  className="grow"
                                  content={slot.begin}
                                  disabled={slot.booked}
                                  onClick={() => {
                                    setSlot(slot);
                                    setClinic(clinic);
                                  }}
                                  selected={slot.id === scheduleState.slot?.id}
                                />
                              );
                            })
                          )}
                        </div>

                        {slots.some(
                          (slot) =>
                            slot.id === scheduleState.slot?.id && !slot.booked,
                        ) && (
                          <Button
                            className="self-end"
                            onClick={() => handleBook(schedule)}
                          >
                            book slot
                            <ClockArrowDown />
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.article>
            );
          })}
        </motion.section>
      )}
    </AnimatePresence>
  );
});

export default ClinicsView;
