import { useAuth } from "../providers/AuthProvider";
import { toast } from "sonner";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const { user } = useAuth();

  if (!user) {
    toast("not logged in, redirecting!");

    return <Navigate to="/auth" />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
