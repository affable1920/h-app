import { lazy } from "react";
import { createBrowserRouter, Outlet, Navigate } from "react-router-dom";

//
import Layout from "@routes/Layout";
import HomePage from "@routes/HomePage";
import Directory from "@routes/Directory";

import ErrorBoundary from "@components/ErrorBoundary";

import SignIn from "@/components/auth/SignIn";
import Register from "@components/auth/Register";
import UserProfile from "./routes/UserProfile";

import { useAuth } from "./providers/AuthProvider";

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
  () => import("@components/doctor/DoctorsDirectory"),
);

const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    ErrorBoundary: ErrorBoundary,

    children: [
      { index: true, Component: HomePage },

      {
        path: "dir",
        Component: Directory,
        children: [
          {
            path: "doctors",
            Component: DoctorsDirectory,
          },

          {
            path: "clinics",
            children: [
              {
                index: true,
                Component: ClinicsDirectory,
              },
            ],
          },
        ],
      },

      {
        path: "doctor/:id",
        Component: () => {
          return <div>Doctor's Profile</div>;
        },
      },

      {
        path: "doctor/:id/schedule",
        Component: Scheduler,
      },

      {
        path: "chat",
        Component: Chat,
      },

      {
        path: "auth/me",
        Component: UserProfile,
      },
    ],
  },

  {
    path: "auth",
    Component: AuthLayout,

    children: [
      { index: true, Component: SignIn },
      { path: "register", Component: Register },
    ],
  },
]);

export default router;

function AuthLayout() {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/dir/doctors" />;
  }

  return (
    <main className="container py-24">
      <Outlet />
    </main>
  );
}
