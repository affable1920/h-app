import { lazy, useEffect } from "react";
import { Navigate, type LoaderFunctionArgs } from "react-router-dom";
import { createBrowserRouter, Outlet, useLocation } from "react-router-dom";

//
import Layout from "@routes/Layout";
import HomePage from "@routes/HomePage";
import Directory from "@routes/Directory";

import drService from "@services/DoctorService";
import ErrorBoundary from "@components/ErrorBoundary";

import SignIn from "@/components/auth/SignIn";
import Register from "@components/auth/Register";
import authClient from "@/services/Auth";
import { toast } from "sonner";

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
        Component: Scheduler,
      },

      { path: "chat", Component: Chat },
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

  {
    path: "auth/me",
    Component: () => {
      useEffect(function () {
        async function fetchProfile() {
          const response = await authClient.profile();
        }

        fetchProfile();
      });

      return <div>Profile component</div>;
    },
  },
]);

export default router;

function AuthLayout() {
  const route = useLocation().pathname;
  const formName = route.endsWith("register") ? "Sign Up" : "Sign In";

  const token = localStorage.getItem("token");

  if (token) {
    toast.info("Already logged in.", {
      description: "Why would anyone wanna login while being logged in ?",
    });

    return <Navigate to="/" />;
  }

  return (
    <div className="container pt-24">
      <div className="box max-w-xs mx-auto gap-8 px-8 pt-6">
        <h2 className="card-h2 text-center uppercase text-xl font-extrabold">
          {formName}
        </h2>
        <Outlet />
      </div>
    </div>
  );
}
