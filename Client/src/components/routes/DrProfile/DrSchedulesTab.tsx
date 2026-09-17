import { ScheduleComponent } from "@/components/ScheduleComponent";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { Stack } from "@/components/ui/Stack";
import { useGetDoctorSchedules } from "@/hooks/use-doctors";
import useModalStore from "@/stores/modal-store";
import type { ProfileResponse } from "@/types/http";
import { Plus, Search } from "lucide-react";
import { useOutletContext } from "react-router-dom";

export function DrSchedulesTab() {
  const doctor = useOutletContext<ProfileResponse<"doctor">>();
  const openModal = useModalStore((s) => s.openModal);

  const { data: { entities: schedules = [] } = {}, isPending } =
    useGetDoctorSchedules({
      id: doctor.id,
    });

  if (isPending) {
    return <Spinner />;
  }

  return (
    <section>
      <Stack justify="end" align="center">
        <Button variant="icon" bg={true}>
          <Search />
        </Button>
        <Button
          onClick={function () {
            openModal("schedule-creater-modal", {
              doctor: doctor,
            });
          }}
          aria-label="schedule-creater-opener"
          variant="icon"
          bg={true}
          size="sm"
          data-tooltip="Create new"
        >
          <Plus />
        </Button>
      </Stack>
      <section className="mt-4">
        <Stack gap="sm" orientation="V" md={{ orientation: "H", gap: "md" }}>
          {schedules.map(function (s) {
            return (
              <ScheduleComponent key={s.id} doctor={doctor} schedule={s} />
            );
          })}
        </Stack>
      </section>
    </section>
  );
}
