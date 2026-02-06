import type { components } from "@/types/api";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { jwtDecode } from "jwt-decode";

type User = components["schemas"]["ResponseUser"];

interface AuthStore {
  token: string | null;
  user: User | null;
  setUser: (jwt: string) => void;
}

const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      user: null,

      setUser: (jwt) => {
        const decoded: User | null = jwtDecode(jwt);
        set({ token: jwt, user: decoded });
      },
    }),
    {
      name: "token",
      partialize: ({ token }) => token,
    },
  ),
);

export default useAuthStore;
