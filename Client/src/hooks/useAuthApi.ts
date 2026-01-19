import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import authClient from "@/services/Auth";
import { useAuth } from "@/components/providers/AuthProvider";
import type { paths } from "@/types/api";

type Bookings =
  paths["/auth/me/appointments"]["get"]["responses"]["200"]["content"]["application/json"];

type DBUser =
  paths["/auth/login"]["post"]["responses"]["200"]["content"]["application/json"];

function useAuthApi() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const profileQuery = useQuery({
    queryKey: ["auth", user?.id],
    queryFn: async () => authClient.get<DBUser>("me").then((res) => res.data),
    enabled: !!user?.id,
  });

  const getAppointments = (enabled: boolean) => {
    return useQuery({
      queryKey: ["auth", user?.id, "appointments"],
      queryFn: async () =>
        authClient.get<Bookings>("me/appointments").then((res) => res.data),
      enabled,
    });
  };

  const unBook = useMutation({
    mutationFn: (id: string) => authClient.delete(`me/appointments/${id}`),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["auth", user?.id] });
    },
  });

  return { profileQuery, getAppointments, unBook };
}

export default useAuthApi;
