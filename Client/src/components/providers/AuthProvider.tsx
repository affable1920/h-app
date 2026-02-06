import {
  useState,
  useMemo,
  useContext,
  createContext,
  type ReactNode,
} from "react";
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

  console.log("Auth state :", state);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const state = useContext(AuthContext);
  return state;
}
