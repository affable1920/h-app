import React, { memo, useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { ArrowRight, MapPinCheckInside } from "lucide-react";

import Button from "./ui/Button";
import { ClockArrowDown } from "lucide-react";

import Badge from "./ui/Badge";

import { getWeekday } from "@/utils/calendarUtils";
import type { Doctor, Clinic, Schedule, Slot } from "@/types/http";

import { DateTime } from "luxon";
import useModalStore from "@/stores/modalStore";
import { useSearchParams } from "react-router-dom";

import { ClinicViewVariants } from "@/utils/uiConstants";

interface ClinicsViewProps {
  doctor: Doctor;
  showClinicsView: boolean;
  onShow: (show: boolean) => void;
}

const EMPTY = Object.create(null);

type State = {
  slot?: Slot;
  clinic?: Clinic;
  schedule: Schedule | null;
  weekday?: number;
};

const ClinicsView: React.FC<ClinicsViewProps> = memo(function ({ ...props }) {
  const { doctor, onShow, showClinicsView } = props;
  const { schedules } = doctor;

  const [clearDateField, setClearDateField] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const [searchParams, setSearchParams] = useSearchParams();
  const [scheduleDetails, setScheduleDetails] = useState<State>({
    schedule: null,
  });

  const openModal = useModalStore((s) => s.openModal);

  function updateDetails<K extends keyof State>(
    this: { schedule: Schedule },
    key: K,
    val: State[K],
  ) {
    function updater(this: { schedule: Schedule }, prev: State) {
      return {
        ...prev,
        schedule: this.schedule,
        [key]: prev[key] !== val && val,
      };
    }

    setScheduleDetails(updater.bind(this));
  }

  useEffect(
    function () {
      if (clearDateField) {
        setSearchParams(function (prev) {
          prev.delete("date");
          return prev;
        });
      }

      setClearDateField(false);
    },
    [clearDateField],
  );

  const isExpanded = useCallback(
    function (id: string) {
      return expandedIds.has(id);
    },
    [expandedIds],
  );

  const paramsDate = searchParams.get("date") ?? "";

  useEffect(
    function () {
      // Auto-expand schedules matching selected date
      if (paramsDate) {
        const date = DateTime.fromISO(paramsDate);
        const wkday = date.weekday;

        const matchingIds = schedules
          .filter((s) => s.weekdays.includes(wkday))
          .map((s) => s.id!);

        onShow(true);
        setExpandedIds(new Set(matchingIds));
      }
    },
    [paramsDate],
  );

  const toggleExpansion = useCallback(function (id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        setClearDateField(true);
      }
      return next;
    });
  }, []);

  function isWkdaySelected(wkday: number) {
    return (
      scheduleDetails?.weekday === wkday ||
      DateTime.fromISO(paramsDate)?.weekday === wkday
    );
  }

  return (
    <AnimatePresence mode="wait">
      {showClinicsView && (
        <motion.section
          key={`${doctor.id}-schedule-view`}
          variants={ClinicViewVariants.containerVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="flex flex-1 flex-col gap-12 text-sm shadow-lg rounded-xl border-2 border-slate-300/20 p-4 font-semibold"
        >
          {schedules.map((schedule) => {
            const {
              id,
              weekdays = [],
              slots = [],
              clinic = {} as Clinic,
            } = schedule;

            const updater = updateDetails.bind({ schedule });

            return (
              <motion.article
                key={id}
                variants={ClinicViewVariants.articleVariants}
                className="flex flex-col gap-6"
              >
                <header className="flex justify-between items-center">
                  <div className="flex flex-col gap-0.5">
                    {clinic?.name}

                    <div className="flex items-center gap-1">
                      {clinic?.location}
                      <MapPinCheckInside size={10} opacity={0.5} />
                    </div>
                  </div>

                  <motion.button
                    initial={false}
                    style={{
                      cursor: "pointer",
                    }}
                    onClick={toggleExpansion.bind(EMPTY, id!)}
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
                      className="flex flex-col gap-6"
                      variants={ClinicViewVariants.innerContainerVariants}
                      initial="initial"
                      animate="animate"
                      exit="initial"
                    >
                      <div className="flex items-center gap-2">
                        {[...new Set(weekdays)].map((wkday) => {
                          return (
                            <motion.button
                              key={wkday}
                              variants={ClinicViewVariants.badgeVariants}
                            >
                              <Badge
                                rounded={false}
                                as={"span"}
                                full={false}
                                className="px-4"
                                onClick={function () {
                                  updater("weekday", wkday);
                                }}
                                selected={isWkdaySelected(wkday)}
                              >
                                {getWeekday(wkday).slice(0, 3)}
                              </Badge>
                            </motion.button>
                          );
                        })}
                      </div>

                      <div className="flex flex-col gap-4">
                        <div className="flex flex-wrap gap-4 justify-center items-center">
                          {slots.every((slot) => slot.booked) ? (
                            <p className="label text-lg text-error-dark">
                              All slots booked !
                            </p>
                          ) : (
                            slots
                              ?.sort((slot) => (slot.booked ? 1 : -1))
                              .map((slot) => {
                                return (
                                  <Badge
                                    rounded={false}
                                    as="button"
                                    full={false}
                                    key={slot.id}
                                    className="flex-1"
                                    content={slot.begin}
                                    onClick={function () {
                                      updater("slot", slot);
                                    }}
                                    disabled={slot.booked}
                                    selected={
                                      slot.id === scheduleDetails.slot?.id
                                    }
                                  />
                                );
                              })
                          )}
                        </div>

                        {slots.some(
                          (slot) =>
                            slot.id === scheduleDetails.slot?.id &&
                            !slot.booked,
                        ) && (
                          <Button
                            color="secondary"
                            className="self-end"
                            onClick={openModal.bind(EMPTY, "schedule", {
                              dr: doctor,
                              viewOverlay: true,
                            })}
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
