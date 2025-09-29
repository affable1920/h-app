import { createBrowserRouter } from "react-router-dom";

//
import Chat from "./Chat";
import Layout from "./Layout";
import HomePage from "./HomePage";
import Scheduler from "./Scheduler";
import DoctorsDashboard from "./DoctorsDashboard";
import useDocStore from "../../stores/doctorsStore";
import DoctorProfile from "./DoctorProfile";
import ErrorBoundary from "../ErrorBoundary";

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

      // doctor routes
      {
        path: "doctors",
        children: [
          { index: true, Component: DoctorsDashboard },
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

      // ai chat route
      { path: "chat", Component: Chat },
    ],
  },
]);

export default router;

async function loadCurrDoctor({ params }: { params: { id?: string } }) {
  const { getDoctorById, currDoctor } = useDocStore.getState();

  if (currDoctor && currDoctor.id === params.id) return currDoctor;
  if (params.id) await getDoctorById(params.id);
}
