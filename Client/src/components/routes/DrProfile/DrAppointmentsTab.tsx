import DirectoryLayout from "@/components/lib/DirectoryLayout";
import { DrAppointmentCard } from "@/components/lib/DrAppointmentCard";
import Pagination from "@/components/Pagination";
import Button from "@/components/lib/button/Button";
import SearchBar from "@/components/ui/SearchBar";
import Spinner from "@/components/ui/Spinner";
import { Stack } from "@/components/ui/Stack";
import { useGetDoctorAppointments } from "@/hooks/use-doctors";
import { RefreshCcw } from "lucide-react";

export function DrAppointmentsTab() {
  const {
    data: { entities: appointments = [], hasNext = false } = {},
    isPending,
    isError,
    refetch,
  } = useGetDoctorAppointments(
    {
      max: 4,
    },
    {
      staleTime: 5 * 60 * 1000,
    },
  );

  if (isPending) {
    return <Spinner />;
  }

  if (isError) {
    return (
      <div className="text-center mx-auto w-full">
        Could not fetch your appointments. <br />
        Please try again ... <br />
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
      </div>
    );
  }

  if (!appointments.length) {
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
      <DirectoryLayout.Header className="justify-end">
        <SearchBar
          id="doctor-appointments-search"
          size="xs"
          className="w-fit"
          value=""
          placeholder="appointments search..."
          aria-label="Search appointments"
        />
      </DirectoryLayout.Header>

      <DirectoryLayout.Content className="space-y-6">
        <Stack orientation="V" md={{ orientation: "H" }} gap={20}>
          {appointments.map(function (appointment) {
            return (
              <DrAppointmentCard
                key={appointment.id}
                appointment={appointment}
              />
            );
          })}
        </Stack>
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
