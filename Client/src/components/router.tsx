import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import { type LoaderFunctionArgs } from "react-router-dom";

//
import Layout from "@routes/Layout";
import HomePage from "@routes/HomePage";
import Directory from "@routes/Directory";

import drService from "@services/DoctorService";
import ErrorBoundary from "@components/ErrorBoundary";

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

const Chat = lazy(() => import("@routes/Chat"));
const Scheduler = lazy(() => import("@routes/Scheduler"));

const ClinicsDirectory = lazy(() => import("@components/ClinicsDirectory"));
const DoctorsDirectory = lazy(
  () => import("@components/doctor/DoctorsDirectory")
);

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
