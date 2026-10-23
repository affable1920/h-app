import { useParams } from "react-router-dom";
import { Stack } from "../ui/Stack";
import { doctorOptions } from "@/hooks/use-doctors";
import { useQuery } from "@tanstack/react-query";

export function DoctorDetails() {
  const { id: doctorId } = useParams();
  const { data: dr } = useQuery(doctorOptions(doctorId!));

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
