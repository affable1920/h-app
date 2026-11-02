import { DrAppointmentCard } from "@/components/DrAppointmentCard";
import Button from "@/components/lib/button/Button";
import { Stack } from "@/components/ui/Stack";
import { useGetDoctorAppointments } from "@/hooks/use-doctors";
import { RefreshCcw } from "lucide-react";
import { useFilters } from "@/hooks/use-filters";
import Spinner from "@/components/ui/Spinner";
import { AppointmentsTab } from "../AppointmentsTab";

export function DrAppointmentsTab() {
  const {
    page,
    activeFiltersCount,
    appointmentStatus,
    searchQuery,
    sortColumn,
    sortOrder,
  } = useFilters();

  const {
    data: { entities: appointments, hasNext = false } = {},
    isError,
    refetch,
    isLoading,
    error,
  } = useGetDoctorAppointments({
    page,
    appointmentStatus,
    searchQuery,
    sortColumn,
    sortOrder: sortOrder ?? undefined,
  });

  const hasAppointments = appointments && appointments.length > 0;

  return (
    <AppointmentsTab hasNext={hasNext ?? false}>
      {isError ? (
        <div className="text-center mx-auto w-full">
          {error.status === 401 ? (
            <p>
              You are not authenticated to view these appointments .. <br />
              Please login or sign up first. <br />
            </p>
          ) : (
            <p>
              Due to an unexpected error <br />
              We could not fetch your appointments right now. <br />
              Please try again later ... <br />
            </p>
          )}
          {![401, 403, 422].includes(error.status) && (
            <Button
              onClick={function () {
                refetch();
              }}
              data-tooltip="Try again"
              className="mt-4"
              variant="icon"
              bg={true}
              aria-label="Retry request to get doctor appointments"
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
          ) : !hasAppointments ? (
            <div className="flex flex-col items-center gap-2">
              {activeFiltersCount === 0 ? (
                <p className="text-center">You have no appointments ..</p>
              ) : (
                <p className="text-center">
                  We found no appointments matching your query ..
                </p>
              )}
            </div>
          ) : (
            appointments.map(function (appointment) {
              return (
                <DrAppointmentCard
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
