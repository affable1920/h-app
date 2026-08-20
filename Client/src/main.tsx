import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";

// Components
import { Toaster } from "sonner";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";

import "./styles/main.css";
import "@fontsource/pt-sans/400";
import "@fontsource/pt-sans/700";
import "@fontsource/pt-sans/400-italic";
import router from "./components/router.tsx";
import { queryClient } from "./core/query-client.ts";

// container
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SpeedInsights />
    <Analytics />
    <QueryClientProvider client={queryClient}>
      <Toaster
        style={{
          fontFamily: "var(--font-display)",
        }}
        position="top-center"
        swipeDirections={["right", "left"]}
        closeButton
        duration={2000}
        visibleToasts={2}
      />
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
