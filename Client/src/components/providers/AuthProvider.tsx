import {
  createContext,
  useState,
  useMemo,
  type ReactNode,
  useEffect,
  useContext,
} from "react";
import { jwtDecode } from "jwt-decode";

interface AuthContextType {
  user: {} | null;
  setUser: (user: any) => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
});

AuthContext.displayName = "AuthContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{} | null>(null);
  const state = useMemo(() => ({ user, setUser }), [user]);

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
