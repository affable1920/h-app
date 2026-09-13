import { lazy, Suspense } from "react";
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  redirect,
  type LoaderFunctionArgs,
  type MiddlewareFunction,
} from "react-router-dom";

//
import Layout from "@routes/Layout";
import HomePage from "@routes/HomePage";
import Directory from "@routes/Directory";

import SignIn from "@/components/routes/SignIn";
import Register from "@/components/routes/Register";
import LandingPage from "@/components/routes/LandingPage";
import App from "@/components/App";
import Spinner from "./ui/Spinner";
import useAuthStore from "@/stores/auth-store";
import { CallProvider } from "@/features/call/components/CallProvider";
import queryClient from "@/core/query-client";
import { doctorOptions } from "@/hooks/use-doctors";
import { PageLayout } from "./routes/PageLayout";
import { DrProfileRoute } from "./routes/DrProfile/DrProfileRoute";
import { PatientProfile } from "./routes/PatientProfile/PatientProfile";
import ProfileSwitcher from "./routes/ProfileSwitcher";
import { DoctorDetails } from "./routes/DoctorDetails";

const Chat = lazy(function () {
  return import("@routes/Chat");
});
const SchedulesView = lazy(function () {
  return import("@/features/booking/SchedulesView");
});
const ClinicsDirectory = lazy(function () {
  return import("@components/ClinicsDirectory");
});
const DoctorsDirectory = lazy(function () {
  return import("@/components/DoctorsDirectory");
});
async function loaderDoctor({ params }: LoaderFunctionArgs) {
  return queryClient.ensureQueryData(doctorOptions(params.id!));
}

const authMiddleware: MiddlewareFunction = async (_, next) => {
  const { token: user } = useAuthStore.getState();

  if (!user) {
    throw redirect("/auth");
  }

  await next();
};

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <CallProvider>
        <App />
      </CallProvider>
    ),
    children: [
      {
        index: true,
        Component: LandingPage,
      },

      {
        path: "/view",
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
            path: "idx",
            element: (
              <PageLayout>
                <Directory />
              </PageLayout>
            ),
            children: [
              {
                path: "doctors",
                element: (
                  <Suspense key="doctor-directory" fallback={<Spinner />}>
                    <DoctorsDirectory />
                  </Suspense>
                ),
              },

              {
                path: "clinics",
                element: (
                  <Suspense key="clinics-directory" fallback={<Spinner />}>
                    <ClinicsDirectory />
                  </Suspense>
                ),
              },
            ],
          },

          {
            path: "doctor/:id",
            children: [
              {
                index: true,
                loader: loaderDoctor,
                element: (
                  <PageLayout>
                    <DoctorDetails />
                  </PageLayout>
                ),
              },
              {
                path: "consult",
                loader: loaderDoctor,
                lazy: async function () {
                  const { TalkOverVideo } =
                    await import("@/features/call/components/TalkOverVideo");
                  return {
                    element: (
                      <PageLayout>
                        <TalkOverVideo />
                      </PageLayout>
                    ),
                  };
                },
              },
              {
                path: "schedule",
                loader: loaderDoctor,
                element: (
                  <PageLayout>
                    <SchedulesView />
                  </PageLayout>
                ),
              },
            ],
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
            path: "auth/me",
            Component: ProfileSwitcher,
            middleware: [authMiddleware],
            children: [
              {
                ...DrProfileRoute,
              },
              {
                element: <PatientProfile />,
              },
            ],
          },
        ],
      },

      {
        path: "auth",
        Component() {
          const token = useAuthStore((s) => s.token);
          return (
            <PageLayout>{token ? <Navigate to="/" /> : <Outlet />}</PageLayout>
          );
        },

        children: [
          { index: true, Component: SignIn },
          { path: "register", Component: Register },
        ],
      },
    ],
  },
]);

export default router;
