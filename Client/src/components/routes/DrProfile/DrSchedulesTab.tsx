import DirectoryLayout from "@/components/lib/DirectoryLayout";
import Pagination from "@/components/Pagination";
import { DrScheduleCard } from "@/features/doctor-scheduling/components/DrScheduleCard";
import Button from "@/components/ui/Button";
import SearchBar from "@/components/ui/SearchBar";
import Spinner from "@/components/ui/Spinner";
import { Stack } from "@/components/ui/Stack";
import { useGetDoctorSchedules } from "@/features/doctor-scheduling/api/queries";
import useModalStore from "@/stores/modal-store";
import type { ProfileResponse } from "@/types/http";
import { Plus, SlidersHorizontal } from "lucide-react";
import { useOutletContext } from "react-router-dom";

export function DrSchedulesTab() {
  const doctor = useOutletContext<ProfileResponse<"doctor">>();
  const openModal = useModalStore((s) => s.openModal);

  const { data: { entities: schedules = [] } = {}, isPending } =
    useGetDoctorSchedules();

  if (isPending) {
    return <Spinner />;
  }

  return (
    <DirectoryLayout>
      <DirectoryLayout.Header className="justify-between">
        <Button disabled={!schedules.length} variant="icon" bg={true}>
          <SlidersHorizontal />
        </Button>

        <Stack>
          <SearchBar
            size="xs"
            clearable={true}
            val=""
            disabled={!schedules.length}
            placeholder="Search for schedules ..."
          />
          <Button
            onClick={function () {
              openModal("schedule-creater-modal", {
                doctor: doctor,
              });
            }}
            aria-label="schedule-creater-opener"
            variant="icon"
            bg={true}
            data-tooltip="Create new"
          >
            <Plus />
          </Button>
        </Stack>
      </DirectoryLayout.Header>

      <DirectoryLayout.Content>
        <Stack gap="sm" orientation="V" md={{ orientation: "H", gap: "md" }}>
          {!schedules.length ? (
            <p className="text-center text-md leading-[1.4] text-text-normal">
              You currently have no{" "}
              <em>
                <strong>schedules</strong>
              </em>
              . Create one by clicking the plus button above.
            </p>
          ) : (
            schedules.map(function (s) {
              return <DrScheduleCard key={s.id} doctor={doctor} schedule={s} />;
            })
          )}
        </Stack>
      </DirectoryLayout.Content>

      {schedules.length > 10 && (
        <DirectoryLayout.Footer>
          <Pagination
            hasNext={true}
            currentPage={1}
            onPageChange={function () {}}
          />
        </DirectoryLayout.Footer>
      )}
    </DirectoryLayout>
  );
}
