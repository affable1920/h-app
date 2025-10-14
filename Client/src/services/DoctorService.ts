import type { Status } from "../types/Doctor";
import useDocStore from "../stores/doctorsStore";
import useModalStore from "../stores/modalStore";
import type { DrCTA, DoctorActions } from "../types/DoctorActions";

const customConfig: Record<Status, DrCTA[]> = {
  available: [
    {
      name: "call",
      icon: "call",
      label: "consult now",
      isPrimary: true,
    },
    {
      name: "schedule",
      icon: "calendar",
      label: "schedule",
      needsDD: true,
    },
  ],

  busy: [
    {
      label: "schedule",
      icon: "calendar",
      name: "schedule",
      needsDD: true,
      isPrimary: true,
    },
    {
      icon: "call",
      name: "schedule",
      label: "Book an appointment",
      needsDD: true,
    },
  ],

  away: [
    {
      isPrimary: true,
      icon: "offline",
      label: "Leave a message",
      name: "message",
    },
    {
      icon: "user",
      label: "View Profile",
      name: "profile",
    },
  ],

  unknown: [
    {
      isPrimary: true,
      icon: "offline",
      label: "Leave a message",
      name: "message",
    },
    {
      label: "View Profile",
      icon: "user",
      name: "profile",
    },
  ],
};

class DoctorService {
  public static cache: Record<string, { x: number; y: number }> = {};
  private _actionMapper: { [key in keyof DoctorActions]: DoctorActions[key] };

  constructor(private _id: string) {
    this._actionMapper = {
      call: this.call.bind(this),
      schedule: this.schedule.bind(this),
      message: this.message.bind(this),
      profile: this.profile.bind(this),
      book: this.book.bind(this),
    };
  }

  book() {}
  message() {}
  profile() {}

  getPos(targetElement: EventTarget & Element) {
    const rect = targetElement.getBoundingClientRect();

    const position = {
      x: rect.left,
      y: rect.bottom,
    };

    return position;
  }

  call() {
    useModalStore.getState().openModal("call", {
      doctorId: this._id,
      viewOverlay: true,
    });
  }

  schedule(targetElement: EventTarget & Element) {
    if (DoctorService.cache[this._id]) {
      console.log("cache hit");

      useModalStore.getState().openModal("schedule", {
        position: DoctorService.cache[this._id],
        doctorId: this._id,
      });

      return;
    }

    const position = this.getPos(targetElement);
    DoctorService.cache[this._id] = position;

    useModalStore
      .getState()
      .openModal("schedule", { position, doctorId: this._id });
  }

  async getDoctorAction(
    doctorId: string,
    targetElement: Element,
    action: keyof DoctorActions
  ) {
    const { currDoctor } = useDocStore.getState();

    if (currDoctor?.id !== doctorId)
      await useDocStore.getState().getDoctorById(doctorId);

    if (action) this._actionMapper[action](targetElement);
  }

  getDoctorInfo(status: Status) {
    if (status) return customConfig[status];
  }
}

export default DoctorService;
