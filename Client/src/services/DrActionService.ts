import { DateTime } from "luxon";
import useModalStore from "@/stores/modalStore";
import actionConfigs from "../utils/doctorActionsConfig";

import type { Position } from "@/types/utils";
import type { DoctorSummary, Slot } from "@/types/doctorAPI";
import type {
  DrCTA,
  DrActionName,
  DoctorActionSignature,
} from "@/types/doctorActions";

type DoctorActions = {
  [k in DrActionName]: DoctorActionSignature;
};

// implements implies that all function mentioned inside the
// doctor actions type are implemented on each doctor instance
export class DrActionService implements DoctorActions {
  private readonly _dr: DoctorSummary;

  // availActions will only consist of available actions for a doctor
  // based on his status, and later -> his preferences such as doctor.consultsOnline?
  public readonly availableActions: DrCTA[];
  protected cache: Record<string, Position> = {};

  constructor(dr: DoctorSummary) {
    this._dr = dr;

    this.availableActions = (function getAvailableActions(dr: DoctorSummary) {
      return actionConfigs[dr.status ?? "away"];
    })(this._dr);
  }

  // private getCTAPosition(target: EventTarget & HTMLButtonElement): Position {
  //   const cacheKey = `${this._data.id}_${target.name}` as string;
  //   if (this.cache[cacheKey]) {
  //     return this.cache[cacheKey];
  //   }

  //   const rect = target.getBoundingClientRect();
  //   const position = {
  //     x: rect.left,
  //     y: rect.bottom,
  //   };

  //   this.cache[cacheKey] = position;
  //   return position;
  // }

  private openActionModal(
    modalName: string,
    options?: { [k: string]: unknown }
  ) {
    useModalStore.getState().openModal(modalName, options ? options : {});
  }

  schedule() {
    const scheduleContext: { [k: string]: unknown } = {};
    const dr = this._dr;

    // if (dr.currently_available) {
    //   scheduleContext["header"] = `Available right now !`;

    //   const remainingSlots = getSlotsLeft(dr, DateTime.now());

    //   if (remainingSlots.length) {
    //     const leftCount = remainingSlots.length;
    //     scheduleContext["tagline"] = `Only ${leftCount} slots left !`;

    //     scheduleContext["link"] = `Book the next available slot`;
    //   }

    //   scheduleContext["tagline"] = `All slots booked !`;
    //   scheduleContext["link"] = `Check next schedule !`;
    // }

    if (dr.next_available) {
      const nextAvailable = DateTime.fromISO(dr.next_available);
      let daysToNext = nextAvailable.diffNow("days").days;

      scheduleContext["nextAvailable"] = nextAvailable;
      daysToNext = Math.ceil(daysToNext);

      const isAvailableTomorrow = daysToNext === 1;

      const targetSchedule = this._dr.schedules.find(
        (s) => s.weekday <= nextAvailable.weekday - 1
      );

      const slotsLeft: Slot[] =
        targetSchedule?.slots.reduce<Slot[]>(
          (acc: Slot[] = [], currSlot: Slot) =>
            currSlot.booked ? acc : [...acc, currSlot],
          []
        ) || [];

      scheduleContext["slotsLeft"] = slotsLeft;
      scheduleContext["nearestSlot"] = slotsLeft[0];

      scheduleContext["tagline"] = isAvailableTomorrow
        ? `Available Tomorrow, only ${slotsLeft.length} slots left !`
        : `Next available in ${daysToNext} days. Book the next available slot`;

      scheduleContext["isAvailableTomorrow"] = isAvailableTomorrow;
    }

    this.openActionModal("schedule", {
      doctor: dr,
      position: "center",
      context: scheduleContext,
    });
  }

  call() {}

  message() {}

  profile() {}

  hasAction(actionName: DrActionName) {
    return (
      this.availableActions.find((action) => action.name === actionName) &&
      typeof this[actionName as keyof this] === "function"
    );
  }

  executeAction(actionName: DrActionName) {
    if (this.hasAction(actionName)) this[actionName].call(this);
  }
}
