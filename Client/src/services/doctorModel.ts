import useModalStore from "@/stores/modalStore";
import actionConfigs from "../services/doctorActionsConfig";
import type { Doctor as DoctorType, Slot } from "@/types/doctorAPI";
import type {
  DrCTA,
  ActionNames,
  // DoctorActions,
  DoctorActionSignature,
} from "@/types/doctorActions";
import { DateTime } from "luxon";
import type { Position } from "@/types/ui";

type DoctorActions = {
  // for doctor functions' execution
  [K in ActionNames]: DoctorActionSignature;
};

// implements implies that all function mentioned inside the
// doctor actions type are implemented on each doctor instance
export class Doctor implements DoctorActions {
  private readonly _data: DoctorType;

  // availActions will only consist of available actions for a doctor
  // based on his status, and later -> his preferences such as doctor.consultsOnline?
  public readonly availableActions: DrCTA[];
  protected cache: Record<string, Position> = {};

  constructor(doc: DoctorType) {
    this._data = doc;

    this.availableActions = function getAvailableActions(this: Doctor) {
      return actionConfigs[this._data.status || "unknown"];
    }.call(this);
  }

  private getCTAPosition(target: EventTarget & HTMLButtonElement): Position {
    const cacheKey = `${this._data.id}_${target.name}` as string;
    if (this.cache[cacheKey]) {
      return this.cache[cacheKey];
    }

    const rect = target.getBoundingClientRect();
    const position = {
      x: rect.left,
      y: rect.bottom,
    };

    this.cache[cacheKey] = position;
    return position;
  }

  private openActionModal(
    modalName: string,
    options?: { [k: string]: unknown }
  ) {
    useModalStore.getState().openModal(modalName, options ? options : {});
  }

  schedule() {
    const scheduleContext: { [k: string]: unknown } = {};

    if (this._data.next_available) {
      const nextAvailable = DateTime.fromISO(this._data.next_available);
      scheduleContext["nextAvailable"] = nextAvailable;

      let daysToNext = nextAvailable.diffNow("days").days;
      daysToNext = Math.ceil(daysToNext);

      const isAvailableTomorrow = daysToNext === 1;

      const targetSchedule = this._data.schedules.find(
        (s) => s.weekday <= nextAvailable.weekday - 1
      );

      const slotsLeft: Slot[] =
        targetSchedule?.slots.reduce<Slot[]>(
          (acc, currSlot) => (currSlot.booked ? acc : [...acc, currSlot]),
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
      doctor: this._data,
      position: "center",
      context: scheduleContext,
    });
  }

  call() {}

  book() {}

  message() {}

  profile() {}

  hasAction(actionName: ActionNames) {
    return (
      actionName in this && typeof this[actionName as keyof this] === "function"
    );
  }

  executeAction(actionName: ActionNames) {
    if (this.hasAction(actionName)) this[actionName].call(this);
  }
}
