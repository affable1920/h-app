import useDocStore from "../stores/doctorsStore";
import useModalStore from "../stores/modalStore";
import type { Status, DrCTA, DoctorActions } from "../types/doc";

const customConfig: Record<Status, DrCTA[]> = {
  available: [
    {
      name: "call",
      icon: "call",
      label: "consult now",
      action: () => {},
      isPrimary: true,
    },
    {
      name: "schedule",
      icon: "calendar",
      label: "schedule",
      needsDD: true,
      action: () => {},
    },
  ],

  busy: [
    {
      label: "schedule",
      icon: "calendar",
      name: "schedule",
      action: () => {},
      needsDD: true,
      isPrimary: true,
    },
    {
      icon: "call",
      name: "schedule",
      label: "Book an appointment",
      needsDD: true,
      action: () => {},
    },
  ],

  away: [
    {
      action: () => {},
      isPrimary: true,
      icon: "offline",
      label: "Leave a message",
      name: "message",
    },
    {
      icon: "user",
      label: "View Profile",
      action: () => {},
      name: "profile",
    },
  ],

  unknown: [
    {
      action: () => {},
      isPrimary: true,
      icon: "offline",
      label: "Leave a message",
      name: "message",
    },
    {
      label: "View Profile",
      icon: "user",
      name: "profile",
      action: () => {},
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
      docID: this._id,
      viewOverlay: true,
    });
  }

  schedule(targetElement: EventTarget & Element) {
    if (DoctorService.cache[this._id]) {
      console.log("cache hit");

      useModalStore.getState().openModal("schedule", {
        position: DoctorService.cache[this._id],
        docID: this._id,
      });

      return;
    }

    const position = this.getPos(targetElement);
    DoctorService.cache[this._id] = position;

    useModalStore
      .getState()
      .openModal("schedule", { position, docID: this._id });
  }

  async getDoctorAction(
    docID: string,
    actionName: keyof DoctorActions,
    targetElement: Element
  ) {
    await useDocStore.getState().getDoctorById(docID);
    if (actionName) this._actionMapper[actionName](targetElement);
  }

  getDoctorInfo(status: Status = "unknown") {
    if (status) return customConfig[status];
  }
}

export default DoctorService;
