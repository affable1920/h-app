import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import authClient from "@/services/Auth";
import { useAuth } from "@/components/providers/AuthProvider";
import type { paths } from "@/types/api";

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

  const unBook = useMutation({
    mutationFn: (id: string) => authClient.delete(`me/appointments/${id}`),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["auth", user?.id] });
    },
  });

  return { profileQuery, unBook };
}

export default useAuthApi;
