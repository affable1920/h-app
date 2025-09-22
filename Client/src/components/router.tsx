import { createBrowserRouter } from "react-router-dom";

//
import Layout from "./Layout";
import DoctorsDashboard from "./DoctorsDashboard";
import HomePage from "./HomePage";
import Chat from "./Chat";
import Scheduler from "./Scheduler";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "", element: <DoctorsDashboard /> },
      { path: "/dashboard", element: <HomePage /> },
      { path: "/schedule", element: <Scheduler /> },
      { path: "/chat", element: <Chat /> },
    ],
  },
]);

export default router;
