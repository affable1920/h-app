import type { RouteObject } from "react-router-dom";
import { PersonalProfileTab } from "./PersonalProfileTab";

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
          Component: DrSchedulesTab,
        };
      },
    },
  ],
};
