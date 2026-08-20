import { lazy, Suspense } from "react";
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  useLoaderData,
  type LoaderFunctionArgs,
} from "react-router-dom";

//
import Layout from "@routes/Layout";
import HomePage from "@routes/HomePage";
import Directory from "@routes/Directory";

import SignIn from "@/components/routes/SignIn";
import Register from "@/components/routes/Register";
import UserProfile from "@components/routes/UserProfile";
import LandingPageBody from "@/components/routes/LandingPage";
import App from "@/components/App";
import Spinner from "./ui/Spinner";
import useAuthStore from "@/stores/auth-store";
import { CallProvider } from "@/features/call/components/CallProvider";
import { getByIdOptions } from "@/hooks/use-doctors";
import { queryClient } from "@/core/query-client";
import type { Doctor } from "@/types/http";
import { Stack } from "./ui/Stack";

const Chat = lazy(function () {
  return import("@routes/Chat");
});
const SchedulesView = lazy(function () {
  return import("@/features/booking/components/SchedulesView");
});
const ClinicsDirectory = lazy(function () {
  return import("@components/ClinicsDirectory");
});
const DoctorsDirectory = lazy(function () {
  return import("@/components/DoctorsDirectory");
});
async function loaderDoctor({ params }: LoaderFunctionArgs) {
  return queryClient.ensureQueryData(getByIdOptions(params.id as string));
}

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
          { Component: HomePage, index: true },

          {
            path: "chat",
            Component: Chat,
          },

          {
            path: "idx",
            Component: Directory,
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
                children: [
                  {
                    index: true,
                    element: (
                      <Suspense key="clinics-directory" fallback={<Spinner />}>
                        <ClinicsDirectory />
                      </Suspense>
                    ),
                  },
                ],
              },
            ],
          },

          {
            path: "doctor/:id/consult",
            lazy: async function () {
              const { TalkOverVideo } =
                await import("@/features/call/components/TalkOverVideo");
              return { Component: TalkOverVideo };
            },
            loader: loaderDoctor,
          },

          {
            path: "doctor/:id",
            loader: loaderDoctor,
            Component: function () {
              const dr = useLoaderData<Doctor>();

              if (!dr) {
                return;
              }

              return (
                <Stack orientation="V" gap="sm">
                  {Object.entries(dr).map(function ([key, val]) {
                    return typeof val === "string" && key != "id" ? (
                      <Stack gap="md">
                        <span className="capitalize text-blue-400">{key}</span>
                        <span className="capitalize">{val}</span>
                      </Stack>
                    ) : null;
                  })}
                </Stack>
              );
            },
          },

          {
            path: "doctor/:id/schedule",
            Component: SchedulesView,
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
        Component() {
          const token = useAuthStore((s) => s.token);
          return token ? <Navigate to="/" /> : <Outlet />;
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
