import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { DoctorDetails } from "../components/routes/DoctorDetails";
import { loaderDoctor, loaderDoctors } from "./loaders";
import { CallProvider } from "@/features/call/components/CallProvider";
import App from "../components/App";
import Directory from "../components/routes/Directory";
import Layout from "../components/routes/AppLayout";
import LandingPage from "../components/routes/LandingPage";
import HomePage from "../components/routes/HomePage";
import ErrorBoundary from "../components/ErrorBoundary";
import useAuthStore from "@/stores/auth-store";
import SignIn from "../components/routes/SignIn";
import Register from "../components/routes/Register";

import {
  authMiddleware,
  workspaceMiddleware,
  workspaceRedirect,
} from "@/routing/middleware";

import {
  drProfileRoute,
  patientProfileRoute,
} from "../components/routes/profileRoutes";
import { PageLayout } from "../components/routes/PageLayout";
import { LayoutRoute } from "../components/LayoutRoute";
import { Chat } from "../components/routes/Chat";

export const router = createBrowserRouter([
  {
    element: (
      <CallProvider>
        <App />
      </CallProvider>
    ),
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        Component: LandingPage,
      },
      {
        path: "auth",
        Component: function () {
          const { token } = useAuthStore.getState();
          return token ? <Navigate to="/app" /> : <Outlet />;
        },
        children: [
          {
            index: true,
            Component: SignIn,
          },
          {
            path: "register",
            Component: Register,
          },
        ],
      },
      {
        path: "app",
        Component: Layout,
        children: [
          {
            index: true,
            element: (
              <PageLayout>
                <HomePage />
              </PageLayout>
            ),
          },
          {
            path: "chat",
            element: (
              <PageLayout>
                <Chat />
              </PageLayout>
            ),
          },
          {
            path: "index",
            children: [
              {
                path: "doctors",
                children: [
                  {
                    element: <Directory />, // pathless listing layout
                    children: [
                      {
                        index: true,
                        loader: loaderDoctors,
                        lazy: async function () {
                          const { DoctorsDirectory } =
                            await import("@components/DoctorsDirectory");

                          return {
                            element: <DoctorsDirectory />,
                          };
                        },
                      },
                    ],
                  },
                  {
                    path: ":id",
                    element: <LayoutRoute />,
                    children: [
                      {
                        index: true,
                        loader: loaderDoctor,
                        Component: DoctorDetails,
                      },
                      {
                        path: "schedule",
                        loader: loaderDoctor,
                        lazy: async function () {
                          const { DrAvailabilityPage } =
                            await import("@features/availability/routes/DoctorAvailabilityPage");
                          return {
                            Component: DrAvailabilityPage,
                          };
                        },
                      },
                      {
                        path: "consult",
                        loader: loaderDoctor,
                        lazy: async function () {
                          const { TalkOverVideo } =
                            await import("@/features/call/components/TalkOverVideo");
                          return {
                            Component: TalkOverVideo,
                          };
                        },
                      },
                    ],
                  },
                ],
              },
              {
                path: "clinics",
                Component: Directory,
                children: [
                  {
                    index: true,
                    lazy: async function () {
                      const { ClinicsDirectory } =
                        await import("@components/ClinicsDirectory");

                      return {
                        element: <ClinicsDirectory />,
                      };
                    },
                  },
                ],
              },
            ],
          },
          {
            path: "workspace",
            middleware: [authMiddleware],
            Component: Outlet,
            children: [
              {
                index: true,
                loader: workspaceRedirect,
              },
              {
                path: "patient",
                middleware: [workspaceMiddleware("patient")],
                children: patientProfileRoute,
              },
              {
                path: "doctor",
                middleware: [workspaceMiddleware("doctor")],
                children: drProfileRoute,
              },
            ],
          },
        ],
      },
    ],
  },
]);
