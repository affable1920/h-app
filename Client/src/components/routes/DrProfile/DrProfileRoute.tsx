import type { RouteObject } from "react-router-dom";
import { PersonalProfileTab } from "./PersonalProfileTab";
import { DrAppointmentsTab } from "./DrAppointmentsTab";

export const DrProfileRoute: RouteObject = {
  children: [
    {
      index: true,
      path: "personal",
      element: <PersonalProfileTab />,
    },
    {
      path: "schedules",
      async lazy() {
        const { DrSchedulesTab } = await import("./DrSchedulesTab");
        return {
          element: <DrSchedulesTab />,
        };
      },
    },
    {
      path: "appointments",
      async lazy() {
        return {
          element: <DrAppointmentsTab />,
        };
      },
    },
    {
      path: "preferences",
      async lazy() {
        return {
          element: <></>,
        };
      },
    },
  ],
};
