import { DrAppointmentCard } from "@/components/lib/DrAppointmentCard";
import Pagination from "@/components/Pagination";
import Spinner from "@/components/ui/Spinner";
import { Stack } from "@/components/ui/Stack";
import { useGetDoctorAppointments } from "@/hooks/use-doctors";
import type { ProfileResponse } from "@/types/http";
import { useOutletContext } from "react-router-dom";

export function DrAppointmentsTab() {
  const doctor = useOutletContext<ProfileResponse<"doctor">>();

  const {
    data: { entities: appointments = [], hasNext = false } = {},
    isPending,
  } = useGetDoctorAppointments(
    {
      id: doctor.id,
    },
    {
      refetchOnMount: false,
    },
  );

  if (isPending) {
    return <Spinner />;
  }

  return (
    <section className="space-y-6">
      <Stack orientation="V" md={{ orientation: "H" }} gap={20}>
        {appointments.map(function (appointment) {
          return (
            <DrAppointmentCard key={appointment.id} appointment={appointment} />
          );
        })}
      </Stack>

      <Stack justify="end">
        <Pagination
          currentPage={1}
          hasNext={hasNext ?? false}
          onPageChange={function () {}}
        />
      </Stack>
    </section>
  );
}
