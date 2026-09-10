import { lazy, Suspense } from "react";
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  redirect,
  useLoaderData,
  type LoaderFunctionArgs,
  type MiddlewareFunction,
} from "react-router-dom";

//
import Layout from "@routes/Layout";
import HomePage from "@routes/HomePage";
import Directory from "@routes/Directory";

import SignIn from "@/components/routes/SignIn";
import Register from "@/components/routes/Register";
import LandingPageBody from "@/components/routes/LandingPage";
import App from "@/components/App";
import Spinner from "./ui/Spinner";
import useAuthStore from "@/stores/auth-store";
import { CallProvider } from "@/features/call/components/CallProvider";
import queryClient from "@/core/query-client";
import type { Doctor } from "@/types/http";
import { Stack } from "./ui/Stack";
import { doctorOptions } from "@/hooks/use-doctors";
import { PageLayout } from "./routes/PageLayout";
import { DrProfileRoute } from "./routes/DrProfile/DrProfileRoute";
import { PatientProfile } from "./routes/PatientProfile/PatientProfile";
import ProfileSwitcher from "./routes/ProfileSwitcher";

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
        Component: LandingPageBody,
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
            loader: loaderDoctor,
            children: [
              {
                index: true,
                Component: function () {
                  const dr = useLoaderData<Doctor>();

                  if (!dr) {
                    return;
                  }

                  return (
                    <PageLayout>
                      <Stack orientation="V" gap="sm">
                        {Object.entries(dr).map(function ([key, val]) {
                          return typeof val === "string" && key != "id" ? (
                            <Stack gap="md">
                              <span className="capitalize text-blue-400">
                                {key}
                              </span>
                              <span className="capitalize">{val}</span>
                            </Stack>
                          ) : null;
                        })}
                      </Stack>
                    </PageLayout>
                  );
                },
              },
              {
                path: "consult",
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
            middleware: [authMiddleware],
            Component: ProfileSwitcher,
            children: [
              {
                ...DrProfileRoute,
              },
              {
                Component: PatientProfile,
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
