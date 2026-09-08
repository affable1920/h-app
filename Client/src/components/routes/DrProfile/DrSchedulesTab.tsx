import { ScheduleComponent } from "@/components/ScheduleComponent";
import Button from "@/components/ui/Button";
import { Stack } from "@/components/ui/Stack";
import useModalStore from "@/stores/modal-store";
import type { ProfileResponse } from "@/types/http";
import { Plus } from "lucide-react";
import { useOutletContext } from "react-router-dom";

export function DrSchedulesTab() {
  const doctor = useOutletContext<ProfileResponse<"doctor">>();
  const openModal = useModalStore((s) => s.openModal);

  return (
    <section className="mt-10">
      <header className="flex items-center justify-between">
        <h2 className="text-lg text-text-normal">Schedules</h2>
        <Stack>
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
      </header>
      <section className="mt-4">
        <Stack gap="sm" orientation="V" md={{ orientation: "H", gap: "md" }}>
          {doctor.schedules.map(function (s) {
            return <ScheduleComponent key={s.id} schedule={s} />;
          })}
        </Stack>
      </section>
    </section>
  );
}
