import { useContext } from "react";
import { AuthContext } from "@/stores/AuthProvider";

export default function useAuth() {
  const state = useContext(AuthContext);
  return state;
}
