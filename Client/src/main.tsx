import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";

// Components
import { Toaster } from "sonner";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "./styles/index.css";
import router from "./components/router.tsx";
import { AuthProvider } from "./components/providers/AuthProvider.tsx";

const client = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

// container
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <QueryClientProvider client={client}>
        <Toaster richColors position="top-center" />
        <RouterProvider router={router} />
        {import.meta.env.DEV && (
          <ReactQueryDevtools buttonPosition="bottom-left" />
        )}
      </QueryClientProvider>
    </AuthProvider>
  </StrictMode>
);
