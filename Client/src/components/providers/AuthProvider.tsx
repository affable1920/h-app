import {
  useState,
  useMemo,
  useEffect,
  useContext,
  createContext,
  type ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";
import type { paths } from "@/types/api";

type User =
  paths["/auth/me"]["get"]["responses"]["200"]["content"]["application/json"];

interface AuthContextType {
  user: User | null;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
});

AuthContext.displayName = "AuthContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const state = useMemo(() => ({ user, setUser }), [user]);

  console.log("Auth provider rendered !");
  console.log("Auth state :", state);

  useEffect(function () {
    const token = localStorage.getItem("token");
    if (token) setUser(jwtDecode(token));
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const state = useContext(AuthContext);
  return state;
}
