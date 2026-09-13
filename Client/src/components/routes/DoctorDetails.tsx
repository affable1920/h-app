import type { Doctor } from "@/types/http";
import { useLoaderData } from "react-router-dom";
import { Stack } from "../ui/Stack";

export function DoctorDetails() {
  const dr = useLoaderData<Doctor>();

  if (!dr) {
    return;
  }

  return (
    <Stack orientation="V" gap="sm">
      {Object.entries(dr).map(function ([key, val]) {
        return typeof val === "string" && key != "id" ? (
          <Stack gap="md">
            <span className="capitalize text-blue-400">{key}</span>
            <span className="capitalize">{val}</span>
          </Stack>
        ) : null;
      })}
    </Stack>
  );
}
