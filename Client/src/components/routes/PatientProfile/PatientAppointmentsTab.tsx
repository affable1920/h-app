import Button from "@/components/lib/button/Button";
import DirectoryLayout from "@/components/lib/DirectoryLayout";
import { PatientAppointmentCard } from "@/components/PatientAppointmentCard";
import Pagination from "@/components/Pagination";
import Spinner from "@/components/ui/Spinner";
import { useGetPatientAppointments } from "@/hooks/use-patients";
import { RefreshCcw, SlidersHorizontal } from "lucide-react";

export function PatientAppointmentsTab() {
  const {
    data: { entities: appointments = [], hasNext = false } = {},
    isPending,
    isError,
    refetch,
    error,
  } = useGetPatientAppointments({ max: 4 });

  if (isPending) {
    return <Spinner />;
  }

  if (isError) {
    return (
      <div className="text-center mx-auto w-full">
        Could not fetch your appointments. <br />
        Please try again ... <br />
        {![403, 422].includes(error.status) && (
          <Button
            onClick={function () {
              refetch();
            }}
            data-tooltip="retry"
            className="mt-4"
            variant="icon"
            bg={true}
            aria-label="Retry-request"
          >
            <RefreshCcw />
          </Button>
        )}
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <p className="text-center text-md leading-[1.4] text-text-normal">
        You currently have no{" "}
        <em>
          <strong>appointments</strong>
        </em>
        .
      </p>
    );
  }

  return (
    <DirectoryLayout>
      {appointments.length > 0 && (
        <DirectoryLayout.Header className="justify-between">
          <Button variant="icon" bg>
            <SlidersHorizontal />
          </Button>
        </DirectoryLayout.Header>
      )}

      <DirectoryLayout.Content className="space-y-6">
        <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
          {appointments.map(function (appointment) {
            return (
              <PatientAppointmentCard
                key={appointment.id}
                appointment={appointment}
              />
            );
          })}
        </div>
      </DirectoryLayout.Content>

      <DirectoryLayout.Footer>
        <Pagination
          currentPage={1}
          hasNext={hasNext ?? false}
          onPageChange={function () {}}
        />
      </DirectoryLayout.Footer>
    </DirectoryLayout>
  );
}

export default PatientAppointmentsTab;
