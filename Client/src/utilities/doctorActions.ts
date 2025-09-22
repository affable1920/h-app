import type { Doc } from "../types/doc";

export function schedule(doctor: Doc) {
  console.log("schedule an app ", doctor.name);
}

const doctorActions: Record<string, (doctor: Doc) => void> = {
  schedule(doctor) {
    console.log("Schedule ", doctor);
  },
};

export default doctorActions;
