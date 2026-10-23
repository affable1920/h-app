import DirectoryLayout from "@/components/lib/DirectoryLayout";
import { DrAppointmentCard } from "@/components/DrAppointmentCard";
import Pagination from "@/components/Pagination";
import Button from "@/components/lib/button/Button";
import SearchBar from "@/components/ui/SearchBar";
import Spinner from "@/components/ui/Spinner";
import { Stack } from "@/components/ui/Stack";
import { useGetDoctorAppointments } from "@/hooks/use-doctors";
import { ArrowUpAZ, RefreshCcw, SlidersHorizontal } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useCallback } from "react";

export function DrAppointmentsTab() {
  const [params, setParams] = useSearchParams();

  const page = params.get("page") ? Number(params.get("page")) : 1;

  const {
    data: { entities: appointments = [], hasNext = false } = {},
    isPending,
    isError,
    refetch,
  } = useGetDoctorAppointments({ max: 4, page });

  const handlePageChange = useCallback(
    function (dir: "next" | "previous") {
      const NOOP =
        (!hasNext && dir === "next") || (page === 1 && dir === "previous");
      if (NOOP) {
        return;
      }

      setParams(function (prev) {
        const next = new URLSearchParams(prev);
        const updated = dir === "next" ? page + 1 : page - 1;

        next.set("page", String(updated));
        return next;
      });
    },
    [hasNext, page, setParams],
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
      {appointments.length > 0 && (
        <DirectoryLayout.Header className="justify-between">
          <Stack align="center">
            <Button
              data-tooltip="filter"
              aria-label={"filter appointments"}
              variant="icon"
              bg
            >
              <SlidersHorizontal />
            </Button>
            <Button
              data-tooltip="sort"
              aria-label={"sort appointments"}
              variant="icon"
              bg
            >
              <ArrowUpAZ />
            </Button>
          </Stack>
          <Stack>
            <SearchBar
              id="doctor-schedules-search"
              aria-label="search schedules"
              size="xs"
              value=""
              placeholder="Search for appointments ..."
            />
          </Stack>
        </DirectoryLayout.Header>
      )}

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
          currentPage={page}
          hasNext={hasNext ?? false}
          onPageChange={handlePageChange}
        />
      </DirectoryLayout.Footer>
    </DirectoryLayout>
  );
}
