import { fromISO } from "@/domain/scheduling/utils";
import { Ban, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { getClassConfig } from "./lib/button/styles";
import Button from "./lib/button/Button";
import Badge from "./ui/Badge";
import Card from "./ui/Card";
import { Stack } from "./ui/Stack";
import type { APIError } from "@/types/http";
import useModalStore from "@/stores/modal-store";
import { useCancelAppointment } from "@/hooks/use-doctors";
import { toast } from "sonner";
import type { components } from "@/types/api";

export type AppointmentDoctorResponse =
  components["schemas"]["AppointmentDoctorResponse"];

export function DrAppointmentCard({
  appointment,
}: {
  appointment: AppointmentDoctorResponse;
}) {
  const openModal = useModalStore((s) => s.openModal);
  const { mutateAsync: cancelAppointment } = useCancelAppointment();

  async function handleCancellation() {
    try {
      await new Promise<void>(function (res, rej) {
        openModal("confirmation-modal", {
          tagline: (
            <>
              Are you sure you want to cancel your appointment with{" "}
              <em>patient</em>{" "}
              <strong>
                {appointment.patient.name ?? appointment.patient.username}
              </strong>
            </>
          ),
          onResolve() {
            res();
          },
          onReject() {
            rej();
          },
        });
      });
    } catch {
      return;
    }

    try {
      await cancelAppointment(appointment.id);
    } catch (exc) {
      const ex = exc as APIError;
      toast.error(ex.code, {
        description: ex.message,
      });
    }
  }

  return (
    <Card className="border-border flex flex-col gap-3">
      <Card.Header className="flex items-start justify-between">
        <Stack orientation="V">
          <Card.Title className="text-base">
            {appointment.patient?.name ?? appointment.patient?.username}
          </Card.Title>
        </Stack>

        <Stack align="center">
          <span className="m-0 inline-flex text-sm font-semibold">
            {fromISO(appointment.scheduledDate).toFormat("dd LLL yyyy")}
          </span>

          <Badge
            size="xs"
            as="span"
            className="font-black"
            color={appointment.status === "active" ? "indicator" : "secondary"}
          >
            {appointment.status}
          </Badge>
        </Stack>
      </Card.Header>

      <Card.Footer className="flex items-center justify-end gap-2">
        {appointment.status === "active" && (
          <Button
            className="opacity-70 hover:opacity-100 transition-opacity duration-150 
            text-text-secondary hover:text-red-700"
            size="xs"
            data-tooltip="cancel"
            onClick={handleCancellation}
          >
            Cancel <Ban />
          </Button>
        )}

        <Link
          to={`/app/workspace/doctor/appointments/${appointment.id}`}
          className={getClassConfig({ size: "xs", color: "brand" })}
          aria-label={`View appointment with ${appointment.patient.name ?? appointment.patient.username ?? "patient"}`}
        >
          View <Eye aria-hidden="true" />
        </Link>
      </Card.Footer>
    </Card>
  );
}
