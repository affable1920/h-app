import type { components } from "@/types/api";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { jwtDecode } from "jwt-decode";

type User = components["schemas"]["ResponseUser"];

interface AuthStore {
  token: string | null;
  user: User | null;
  setUser: (jwt: string) => void;
  getUser: () => User | null;
}

const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,

      getUser() {
        const jwt = get().token;

        if (jwt) {
          return jwtDecode(jwt);
        } else {
          return null;
        }
      },

      setUser(jwt) {
        const decoded = jwtDecode<User>(jwt);
        set({ user: decoded, token: jwt });
      },
    }),

    {
      name: "auth-storage",

      partialize(state) {
        return { token: state.token };
      },

      onRehydrateStorage() {
        return (store) => {
          if (store?.token) {
            store.setUser(store.token);
          }
        };
      },
    },
  ),
);

export const logout = () => {
  useAuthStore.persist.clearStorage();
  window.location.href = "/";
};

export default useAuthStore;
