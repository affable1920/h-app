import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";

// Components
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import "./styles/main.css";
import "@fontsource/pt-sans/400";
import "@fontsource/pt-sans/700";
import "@fontsource/pt-sans/400-italic";

import router from "./components/router.tsx";

const client = new QueryClient();

// container
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={client}>
      <Toaster
        style={{
          fontFamily: "var(--font-display)",
        }}
        position="top-center"
        swipeDirections={["right", "left"]}
        closeButton
        duration={1500}
      />
      <RouterProvider router={router} />

      {import.meta.env.DEV && (
        <ReactQueryDevtools buttonPosition="bottom-left" />
      )}
    </QueryClientProvider>
  </StrictMode>,
);
