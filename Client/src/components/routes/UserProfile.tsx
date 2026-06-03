import useAuthStore from "@/stores/authStore";
import { DrProfile } from "../DrProfile";
import { PatientProfile } from "../PatientProfile";

function UserProfile() {
  const role = useAuthStore((s) => s.role);

  if (role === "doctor") {
    return <DrProfile />;
  }

  if (role === "patient") {
    return <PatientProfile />;
  }

  return null;
}

export default UserProfile;
