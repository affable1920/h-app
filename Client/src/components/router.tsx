import { createBrowserRouter } from "react-router-dom";

//
import Layout from "./Layout";
import DoctorsDashboard from "./DoctorsDashboard";
import HomePage from "./HomePage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "", element: <DoctorsDashboard /> },
      { path: "/dashboard", element: <HomePage /> },
    ],
  },
]);

export default router;
