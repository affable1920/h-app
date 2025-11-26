import { createBrowserRouter, type LoaderFunctionArgs } from "react-router-dom";

//
import Chat from "@routes/Chat";
import Layout from "@routes/Layout";
import HomePage from "@routes/HomePage";
import Scheduler from "@routes/Scheduler";
import Directory from "@routes/Directory";

import drService from "@services/DoctorService";

import ErrorBoundary from "@components/ErrorBoundary";
import ClinicsDirectory from "@components/ClinicsDirectory";
import DoctorsDirectory from "@components/doctor/DoctorsDirectory";

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

async function loadDoctor({ params }: LoaderFunctionArgs) {
  if (!params?.id) return;
  return await drService.getById(params.id);
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorBoundary />,

    children: [
      { index: true, Component: HomePage },

      {
        Component: Directory,
        children: [
          {
            path: "doctors",
            children: [
              {
                index: true,
                loader: loadDoctor,
                Component: DoctorsDirectory,
              },

              {
                path: "clinics",
                children: [{ index: true, Component: ClinicsDirectory }],
              },
            ],
          },
        ],
      },

      {
        path: "doctors/:id",
        loader: loadDoctor,
        Component: () => <div>Doctor's Profile</div>,
      },

      {
        path: "doctors/:id/schedule",
        loader: loadDoctor,
        Component: Scheduler,
      },

      // ai chat route
      { path: "chat", Component: Chat },
    ],
  },
]);

export default router;
