import type { Role, UserResponse } from "@/types/user";
import { jwtDecode } from "jwt-decode";
import { create } from "zustand";

interface AuthStore {
  token: string | null;
  user: UserResponse | null;
  role: Role | null;
  setUser: (usr: UserResponse) => void;
  saveToken: (jwt: string) => void;
  clearAuth: () => void;
}

const useAuthStore = create<AuthStore>((set) => ({
  user: null,

  setUser(usr) {
    set({ user: usr });
  },

  token: null,
  role: null,
  saveToken(jwt) {
    set({
      token: jwt,
      role: jwtDecode<{ role: "doctor" | "patient" }>(jwt).role,
    });
  },

  clearAuth() {
    set({ token: null, user: null, role: null });
  },
}));

export default useAuthStore;
