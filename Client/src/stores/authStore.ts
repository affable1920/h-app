import { create } from "zustand";
import { persist } from "zustand/middleware";

import { jwtDecode } from "jwt-decode";

interface AuthStore {
  token: string | null;
  user: any | null;
  setUser: (jwt: string) => void;
  getUser: () => any | null;
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
        const decoded = jwtDecode(jwt);
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
