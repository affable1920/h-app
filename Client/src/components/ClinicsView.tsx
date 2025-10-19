import React, { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, type Variant } from "motion/react";

import { BsArrowRight } from "react-icons/bs";
import { BiLocationPlus } from "react-icons/bi";
import type { Weekday } from "../utils/constants";

import Button from "./Button";
import useScheduleStore from "../stores/scheduleStore";

import { FaLink } from "react-icons/fa";
import { Link } from "react-router-dom";
import Badge from "./Badge";
import Spinner from "./Spinner";
import type { Clinic, Schedule, Slot } from "../types/Doctor";

const scheduleVariants: Record<string, Variant> = {
  initial: {
    scale: 0,
    opacity: 0,
  },
  view: {
    scale: 1,
    opacity: 1,
  },
};

const ClinicsView = React.memo(
  ({ targetSchedules }: { targetSchedules: Schedule[] }) => {
    const selectedDate = useScheduleStore((s) => s.selectedDate);
    const selectedSlot = useScheduleStore((s) => s.selectedSlot);
    const selectedClinic = useScheduleStore((s) => s.selectedClinic);

    const setSelectedSlot = useScheduleStore((s) => s.setSelectedSlot);

    const [viewSchedules, setViewSchedules] = useState(false);
    const [selectedWeekday, setSelectedWeekday] = useState<Weekday | null>(
      null
    );

    const [loading, setloading] = useState(false);

    const handleWkdaySelect = useCallback((wkday: Weekday) => {
      setSelectedWeekday((p) => (p === wkday ? null : wkday));
    }, []);

    useEffect(() => {
      if (selectedDate) setViewSchedules(true);
      setSelectedWeekday(selectedDate?.weekdayLong?.toLowerCase() as Weekday);
    }, [selectedDate]);

    if (!targetSchedules || !targetSchedules.length) return;

    function toggleSchedulesView() {
      setViewSchedules((p) => !p);
    }

    async function handleSchedule(s: Schedule) {
      // const data = {
      //   slot: selectedSlot,
      //   date: selectedDate?.toISO(),
      //   clinic: selectedClinic ?? s?.clinic?.id,
      // };

      try {
        setloading(true);
      } catch (ex) {
        console.log(ex);
      } finally {
        setloading(false);
      }
    }

    const showBookingInfo = selectedDate && selectedSlot;

    return (
      <AnimatePresence mode="sync">
        <motion.section
          key="schedule"
          className="box py-4 flex flex-col gap-8 w-full"
          initial="initial"
          animate="view"
          exit="initial"
          variants={scheduleVariants}
          transition={{
            duration: 0.22,
            ease: "easeOut",
            when: "beforeChildren",
          }}
        >
          {targetSchedules.map((s) => {
            const { clinic = {} as Clinic, weekday, slots = [] } = s || {};

            return (
              <article className="flex flex-col gap-4" key={clinic?.id}>
                <header className="flex justify-between items-center gap-6">
                  <div className="flex flex-col gap-0.5">
                    <Link to="/">
                      <h2 className="card-h2 flex items-center gap-1">
                        {clinic?.name}{" "}
                        <FaLink className="text-xs opacity-60 hover:opacity-100" />
                      </h2>
                    </Link>

                    <Link
                      to="/"
                      className={`flex items-center gap-2 text-sm underline underline-offset-2`}
                    >
                      <p>{clinic?.address} </p>
                      <BiLocationPlus className="text-xs opacity-80 hover:opacity-100" />
                    </Link>
                  </div>
                  <Button
                    variant="icon"
                    initial="false"
                    needsMotion={true}
                    animate={{
                      rotate: viewSchedules ? 90 : 0,
                    }}
                    className="cursor-pointer"
                    onClick={toggleSchedulesView}
                  >
                    <BsArrowRight />
                  </Button>
                </header>

                <motion.div
                  initial={false}
                  animate={{
                    x: viewSchedules ? 0 : 40,
                    opacity: viewSchedules ? 1 : 0,
                    height: viewSchedules ? "auto" : 0,
                    overflow: viewSchedules ? "visible" : "hidden",
                  }}
                  className="flex flex-col text-sm gap-4"
                >
                  <Badge
                    entity={weekday as Weekday}
                    className="capitalize self-start"
                    isOn={(wk) => selectedWeekday === wk}
                    content={(weekday as Weekday).slice(0, 3)}
                    onClick={() => handleWkdaySelect(weekday as Weekday)}
                  />
                  <div className="flex items-center gap-4">
                    {weekday === selectedWeekday &&
                      slots?.map((slot) => (
                        <Badge
                          key={slot.begin}
                          content={slot.begin}
                          className="self-start"
                          entity={slot as Slot}
                          isOn={(s) => selectedSlot === s}
                          onClick={() => setSelectedSlot(slot)}
                          isDisabled={() => slot.booked as boolean}
                        />
                      ))}
                  </div>

                  {showBookingInfo && (
                    <Button
                      size="md"
                      initial={{ y: 40, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      needsMotion={true}
                      variant="contained"
                      color="accent"
                      disabled={loading}
                      onClick={() => handleSchedule(s)}
                      className="self-end flex items-center gap-2"
                    >
                      Confirm Slot <Spinner loading={loading} />
                    </Button>
                  )}
                </motion.div>
              </article>
            );
          })}
        </motion.section>
      </AnimatePresence>
    );
  }
);

export default ClinicsView;
