import useAuthStore from "@/stores/auth-store";
import { Navigate } from "react-router-dom";
import { PatientProfile } from "./PatientProfile/PatientProfile";
import { DrProfile } from "./DrProfile/DrProfile";

export default function ProfileSwitcher() {
  const role = useAuthStore((s) => s.role);

  if (role === "doctor") {
    return <DrProfile />;
  }

  if (role === "patient") {
    return <PatientProfile />;
  }

  return <Navigate to="/" replace={true} />;
}
