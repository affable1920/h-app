import APIClient from "@/services/ApiClient";
import { useQuery } from "@tanstack/react-query";

const endpoint = `/doctors/${id}`;
const api = APIClient("/doctors");

function useScheduleQuery(id: string) {
  const queryKey = ["doctors", id, "schedules"];

  return useQuery({
    queryKey,
  });
}
