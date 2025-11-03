import { createBrowserRouter } from "react-router-dom";

//
import Chat from "./routes/Chat";
import Layout from "./routes/Layout";
import HomePage from "./routes/HomePage";
import Scheduler from "./routes/Scheduler";
import Directory from "./routes/Directory";
import ErrorBoundary from "./ErrorBoundary";
import ClinicsDirectory from "./ClinicsDirectory";
import DoctorProfile from "./doctor/DoctorProfile";
import DoctorsDirectory from "./doctor/DoctorsDirectory";
import drService from "@/services/DoctorService";

/*
API Routes Structure:
/                          # Home
/doctors                   # List all doctors
/doctors/:id               # Doctor profile
/doctors/:id/schedule      # Schedule with doctor
/doctors/:id/chat          # Chat with doctor
/appointments              # User's appointments
/appointments/:id          # Specific appointment
/chat 
*/

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorBoundary />,

    children: [
      // app home page
      { index: true, Component: HomePage },

      {
        Component: Directory,
        children: [
          {
            path: "doctors",
            children: [
              {
                index: true,
                Component: DoctorsDirectory,
              },

              {
                path: ":id",
                Component: DoctorProfile,
                loader: getDr,
              },

              {
                path: ":id/schedule",
                Component: Scheduler,
                loader: getDr,
              },
            ],
          },
          {
            path: "clinics",
            children: [{ index: true, Component: ClinicsDirectory }],
          },
        ],
      },

      // ai chat route
      { path: "chat", Component: Chat },
    ],
  },
]);

export default router;

async function getDr({ params }: { params: { id?: string } }) {
  return drService.getById(params.id!);
}
