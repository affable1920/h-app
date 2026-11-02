import Button from "@/components/lib/button/Button";
import { PatientAppointmentCard } from "@/components/PatientAppointmentCard";
import Spinner from "@/components/ui/Spinner";
import { useGetPatientAppointments } from "@/hooks/use-patients";
import { RefreshCcw } from "lucide-react";
import { Stack } from "@/components/ui/Stack";
import { AppointmentsTab } from "../AppointmentsTab";
import { useFilters } from "@/hooks/use-filters";

export function PatientAppointmentsTab() {
  const {
    page,
    appointmentStatus,
    activeFiltersCount,
    searchQuery,
    sortColumn,
    sortOrder,
  } = useFilters();

  const {
    data: { entities: appointments, hasNext = false } = {},
    isLoading,
    isError,
    refetch,
    error,
  } = useGetPatientAppointments({
    page,
    appointmentStatus,
    searchQuery,
    sortColumn,
    sortOrder,
  });

  const hasAppointments = appointments && appointments.length > 0;

  return (
    <AppointmentsTab hasNext={hasNext ?? false}>
      {isError ? (
        <div className="text-center mx-auto w-full">
          Due to an unexpected error <br />
          We could not fetch your appointments right now. <br />
          Please try again later ... <br />
          {![403, 422].includes(error.status) && (
            <Button
              onClick={function () {
                refetch();
              }}
              data-tooltip="Try again"
              className="mt-4"
              variant="icon"
              bg={true}
              aria-label="Retry request to get patient appointments"
            >
              <RefreshCcw />
            </Button>
          )}
        </div>
      ) : (
        <Stack
          orientation="V"
          md={{ orientation: "H", align: "center" }}
          gap={20}
        >
          {isLoading ? (
            <Spinner />
          ) : !hasAppointments && activeFiltersCount === 0 ? (
            <p className="font-semibold text-center">
              You have no appointments ..
            </p>
          ) : !hasAppointments ? (
            <p className="font-semibold text-center">
              We found no appointments matching your query ..
            </p>
          ) : (
            appointments.map(function (appointment) {
              return (
                <PatientAppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                />
              );
            })
          )}
        </Stack>
      )}
    </AppointmentsTab>
  );
}

export default PatientAppointmentsTab;
