import { lazy, Suspense, type ReactNode } from "react";
import {
  createBrowserRouter,
  Navigate,
  Outlet,
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
import TalkOverVideo from "../features/call/components/TalkOverVideo";
import { CallProvider } from "@/features/call/components/CallProvider";
import { getByIdOptions } from "@/hooks/use-doctors";
import { queryClient } from "@/core/query-client";

const Chat = lazy(() => import("@routes/Chat"));
const SchedulesView = lazy(
  () => import("@/features/booking/components/SchedulesView"),
);

const ClinicsDirectory = lazy(() => import("@components/ClinicsDirectory"));
const DoctorsDirectory = lazy(() => import("@/components/DoctorsDirectory"));

function Fallback({ children, key }: { children: ReactNode; key?: string }) {
  return (
    <Suspense key={key} fallback={<Spinner loading />}>
      {children}
    </Suspense>
  );
}

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
            element: (
              <Fallback key="chat-route">
                <Chat />
              </Fallback>
            ),
          },

          {
            path: "idx",
            Component: Directory,
            children: [
              {
                path: "doctors",
                element: (
                  <Suspense
                    key="doctor-directory"
                    fallback={<Spinner loading />}
                  >
                    <DoctorsDirectory />
                  </Suspense>
                ),
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
            path: "doctor/:id/consult",
            Component: TalkOverVideo,
            loader: loaderDoctor,
          },

          {
            path: "doctor/:id",
            loader: loaderDoctor,
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
