import { createBrowserRouter } from "react-router-dom";

//
import Chat from "./routes/Chat";
import Layout from "./routes/Layout";
import HomePage from "./routes/HomePage";
import Scheduler from "./routes/Scheduler";
import Directory from "./routes/Directory";
import ErrorBoundary from "./ErrorBoundary";
import ClinicsDirectory from "./ClinicsDirectory";
import DoctorProfile from "./Doctor/DoctorProfile";
import useDoctorsStore from "../stores/doctorsStore";
import DoctorsDirectory from "./Doctor/DoctorsDirectory";

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
                loader: loadCurrDoctor,
              },

              {
                path: ":id/schedule",
                Component: Scheduler,
                loader: loadCurrDoctor,
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

async function loadCurrDoctor({ params }: { params: { id?: string } }) {
  const { getDoctorById, currDoctor } = useDoctorsStore.getState();

  if (currDoctor?.id === params.id) return currDoctor;
  if (params.id) await getDoctorById(params.id);
}
