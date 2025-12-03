import { memo, useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, type Variant } from "motion/react";

import { BsArrowRight } from "react-icons/bs";
import { BiSolidMapPin } from "react-icons/bi";

import Button from "./common/Button";

import { ClockArrowDown } from "lucide-react";

import Badge from "./common/Badge";
import { Link } from "react-router-dom";

import { WEEKDAYS } from "@/utils/constants";
import useScheduleStore from "../stores/scheduleStore";

import useModalStore from "@/stores/modalStore";
import { set as setSchedule } from "../stores/scheduleStore";
import type { Doctor, Clinic, Schedule, Slot } from "../types/doctorAPI";

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

const ClinicsView = memo(function ({
  doctor,
  onShow,
  schedules,
  showClinicsView,
}: {
  doctor: Doctor;
  schedules: Schedule[];
  showClinicsView: boolean;
  onShow: (show: boolean) => void;
}) {
  const selectedDate = useScheduleStore((s) => s.selectedDate);

  const setSelectedDate = useScheduleStore((s) => s.setSelectedDate);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const selectedSlot = useScheduleStore((s) => s.selectedSlot);
  const setSelectedSlot = useScheduleStore((s) => s.setSelectedSlot);

  const isExpanded = useCallback(
    (id: string) => expandedIds.has(id),
    [expandedIds]
  );

  // Auto-expand schedules matching selected date
  useEffect(() => {
    if (selectedDate) {
      const matchingIds = schedules
        .filter((s) => s.weekday === selectedDate.weekday)
        .map((s) => s.id!);

      setExpandedIds(new Set(matchingIds));
      onShow(true);
    }
  }, [selectedDate, schedules, onShow]);

  const toggleExpansion = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        if (!expandedIds.has(id)) {
          setSelectedDate(null);
        }
      }
      return next;
    });
  }, []);

  async function handleBook(slot: Slot, clinic: Clinic, schedule: Schedule) {
    setSchedule({
      selectedSlot: slot,
      selectedClinic: clinic,
      selectedSchedule: schedule,
    });

    useModalStore.getState().openModal("schedule", { dr: doctor });
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
          className="box py-4 flex flex-col w-full gap-12"
        >
          {schedules.map((schedule) => {
            const {
              id,
              weekday,
              slots = [],
              clinic = {} as Clinic,
            } = schedule || {};

            return (
              <motion.article
                key={id}
                variants={articleVariants}
                className="schedule-view-box flex flex-col gap-6 "
              >
                <header className="flex justify-between items-center">
                  <div className="flex flex-col gap-0.5">
                    <Link className="flex items-center gap-2 card-h2" to="/">
                      {clinic?.name}
                    </Link>

                    <Link
                      to="/"
                      className={`flex items-center gap-1 text-sm underline underline-offset-2`}
                    >
                      {clinic?.address}
                      <BiSolidMapPin size={8} />
                    </Link>
                  </div>

                  <Button
                    variant="icon"
                    initial={false}
                    needsMotion={true}
                    onClick={() => toggleExpansion(id!)}
                    animate={{
                      rotate: isExpanded(id!) ? 90 : 0,
                    }}
                  >
                    <BsArrowRight />
                  </Button>
                </header>

                <AnimatePresence>
                  {isExpanded(schedule.id!) && (
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
                      <Badge
                        as="button"
                        full={false}
                        className="self-center"
                        content={WEEKDAYS[weekday]}
                        selected={weekday === selectedDate?.weekday}
                      />

                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-center flex-wrap gap-4">
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
                                  content={slot.begin}
                                  disabled={slot.booked}
                                  onClick={() => setSelectedSlot(slot)}
                                  selected={slot.id === selectedSlot?.id}
                                />
                              );
                            })
                          )}
                        </div>

                        {slots.some((slot) => slot.id === selectedSlot?.id) && (
                          <Button
                            onClick={() =>
                              handleBook(selectedSlot!, clinic, schedule)
                            }
                            className="self-end flex items-center gap-2 text-sm capitalize"
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
