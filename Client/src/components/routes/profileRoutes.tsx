import { type RouteObject } from "react-router-dom";
import { PersonalProfileTab } from "@routes/DrProfile/PersonalProfileTab";
import { PatientProfile } from "./PatientProfile/PatientProfile";
import { DrProfile } from "./DrProfile/DrProfile";
import { AppointmentViewPage } from "../AppointmentViewPage";

export const patientProfileRoute: RouteObject[] = [
  {
    element: <PatientProfile />,
    children: [
      {
        index: true,
        path: "appointments",
        async lazy() {
          const { PatientAppointmentsTab } =
            await import("./PatientProfile/PatientAppointmentsTab");
          return {
            element: <PatientAppointmentsTab />,
          };
        },
      },
    ],
  },
  {
    path: "appointments/:appointmentId",
    element: <AppointmentViewPage role="patient" />,
  },
];

export const drProfileRoute: RouteObject[] = [
  {
    element: <DrProfile />,
    children: [
      {
        index: true,
        path: "personal",
        element: <PersonalProfileTab />,
      },
      {
        path: "schedules",
        async lazy() {
          const { DrSchedulesTab } =
            await import("@routes/DrProfile/DrSchedulesTab");
          return {
            Component: DrSchedulesTab,
          };
        },
      },
      {
        path: "appointments",
        lazy: async function () {
          const { DrAppointmentsTab } =
            await import("@routes/DrProfile/DrAppointmentsTab");
          return {
            Component: DrAppointmentsTab,
          };
        },
      },
      {
        path: "clinics",
        async lazy() {
          const { DoctorClinicsTab } =
            await import("@features/doctor-clinics/routes/DoctorClinicsTab");

          return {
            Component: DoctorClinicsTab,
          };
        },
      },
    ],
  },
  {
    path: "appointments/:appointmentId",
    element: <AppointmentViewPage role="doctor" />,
  },
];
