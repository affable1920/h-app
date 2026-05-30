import type { UserResponse } from "@/types/http";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthStore {
  token: string | null;
  user: UserResponse | null;
  setUser: (usr: UserResponse) => void;
  saveToken: (jwt: string) => void;
}

const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      user: null,

      setUser(usr) {
        set({ user: usr });
      },

      saveToken(jwt) {
        set({ token: jwt });
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
