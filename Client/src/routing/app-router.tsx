import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { loaderAppointment, loaderDoctor } from "./loaders";

// feature-components
import { CallProvider } from "@features/call/components/CallProvider";
import { Consultation } from "@/features/call/components/Consultation";

// routes
import { DoctorDetails } from "@routes/DoctorDetails";
import Directory from "@routes/Directory";
import Layout from "@routes/AppLayout";
import LandingPage from "@routes/LandingPage";
import HomePage from "@routes/HomePage";
import SignIn from "@routes/SignIn";
import Register from "@routes/Register";
import { drProfileRoute, patientProfileRoute } from "@routes/profileRoutes";
import { PageLayout } from "@routes/PageLayout";
import { Chat } from "@routes/Chat";

// stores
import useAuthStore from "@stores/auth-store";

// app-components
import App from "@components/App";
import ErrorBoundary from "@components/ErrorBoundary";
import { LayoutRoute } from "@components/LayoutRoute";
import { HydrateFallback } from "@/components/HydrateFallback";

// routing services
import {
  authMiddleware,
  requireRole,
  workspaceIndex,
  workspaceRedirect,
} from "@/routing/middleware";
import { WorkspaceBoundary } from "@/components/WorkspaceBoundary";
import { ensureSessionAtStartup } from "./restoreSession";

export const router = createBrowserRouter([
  {
    element: (
      <CallProvider>
        <App />
      </CallProvider>
    ),
    middleware: [ensureSessionAtStartup],
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
        HydrateFallback,
        children: [
          {
            path: "consultation/:appointmentId",
            element: (
              <PageLayout>
                <Consultation />
              </PageLayout>
            ),
            loader: loaderAppointment,
          },
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
                    element: <Directory />,
                    children: [
                      {
                        index: true,
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
            errorElement: <WorkspaceBoundary />,
            Component: Outlet,
            children: [
              {
                index: true,
                loader: workspaceRedirect,
              },
              {
                path: "patient",
                loader: requireRole("patient"),
                children: [
                  { index: true, loader: workspaceIndex("patient") },
                  ...patientProfileRoute,
                ],
              },
              {
                path: "doctor",
                loader: requireRole("doctor"),
                children: [
                  {
                    index: true,
                    loader: workspaceIndex("doctor"),
                  },
                  ...drProfileRoute,
                ],
              },
            ],
          },
        ],
      },
    ],
  },
]);
