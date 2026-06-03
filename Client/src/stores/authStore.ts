import type { Role, UserResponse } from "@/types/http";
import { jwtDecode } from "jwt-decode";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthStore {
  token: string | null;
  user: UserResponse | null;
  role: Role | null;
  setUser: (usr: UserResponse) => void;
  saveToken: (jwt: string) => void;
}

const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      user: null,

      role: null,

      setUser(usr) {
        set({ user: usr });
      },

      saveToken(jwt) {
        set({
          token: jwt,
          role: jwtDecode<{ role: "doctor" | "patient" }>(jwt).role,
        });
      },
    }),

    {
      name: "auth-storage",
    },
  ),
);

export function logout() {
  useAuthStore.persist.clearStorage();
  window.location.href = "/auth";
}

export default useAuthStore;
