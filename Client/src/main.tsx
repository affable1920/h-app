import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";

// Components
import router from "./components/routes/router.tsx";

// stylesheets
import "./styles/config.css";
import "./styles/utils.css";
import "./styles/components.css";
import "./styles/button_styles.css";

// container
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
