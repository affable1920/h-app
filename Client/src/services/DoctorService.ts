import useModalStore from "../stores/modalStore";
import type { Status, DrCTA } from "../types/doc";

const customConfig: Record<Status, DrCTA[]> = {
  available: [
    {
      icon: "call",
      name: "consult now",
      action: () => {},
      isPrimary: true,
    },
    {
      icon: "calendar",
      name: "schedule",
      needsDD: true,
      action: () => {},
    },
  ],

  busy: [
    {
      action: () => {},
      icon: "calendar",
      name: "schedule",
      needsDD: true,
      isPrimary: true,
    },
    {
      icon: "calendar",
      name: "Schedule",
      needsDD: true,
      action: () => {},
    },
  ],

  away: [
    {
      action: () => {},
      isPrimary: true,
      icon: "offline",
      name: "Leave a message",
    },
    {
      icon: "user",
      name: "View Profile",
      action: () => {},
    },
  ],

  unknown: [
    {
      action: () => {},
      isPrimary: true,
      icon: "offline",
      name: "Leave a message",
    },
    {
      icon: "user",
      name: "View Profile",
      action: () => {},
    },
  ],
};

class DoctorService {
  static cache: Record<string, { x: number; y: number }>;

  constructor(private _id: string) {}

  getPos(ev: React.MouseEvent) {
    if (ev.currentTarget.textContent.trim().toLowerCase() !== "schedule")
      return;

    if (DoctorService.cache[this._id]) {
      console.log("cache hit");
      useModalStore.getState().openModal("schedule", {
        position: DoctorService.cache[this._id],
        docID: this._id,
      });
      return;
    }

    const rect = ev.currentTarget.getBoundingClientRect();
    const position = {
      x: rect.left,
      y: rect.bottom,
    };

    DoctorService.cache[this._id] = position;
    useModalStore
      .getState()
      .openModal("schedule", { position, docID: this._id });
  }

  getDoctorAction() {}

  getDoctorInfo(status: Status = "unknown") {
    if (status) return customConfig[status || "unknown"];
  }
}

export default DoctorService;
