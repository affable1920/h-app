import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";

// Components
import router from "./components/router.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// stylesheets
import "./styles/config.css";
import "./styles/utils.css";
import "./styles/components.css";
import "./styles/button_styles.css";

const client = new QueryClient();

// container
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={client}>
      {/* <ReactQueryDevtools position="top" /> */}
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>
);
