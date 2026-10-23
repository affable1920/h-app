import { fromISO } from "@/domain/scheduling/utils";
import { Eye, Trash } from "lucide-react";
import Button from "./lib/button/Button";
import Badge from "@components/ui/Badge";
import Card from "@components/ui/Card";
import { Stack } from "@components/ui/Stack";
import type { APIError } from "@/types/http";
import useModalStore from "@/stores/modal-store";
import { useCancelAppointment } from "@/hooks/use-doctors";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { getClassConfig } from "./lib/button/styles";
import type { AppointmentPatientResponse } from "@/types/appointment";

export function PatientAppointmentCard({
  appointment,
}: {
  appointment: AppointmentPatientResponse;
}) {
  const appointmentDoctor = appointment.doctor;
  const openModal = useModalStore((s) => s.openModal);
  const { mutateAsync: cancelAppointment } = useCancelAppointment();

  async function handleCancellation() {
    try {
      await new Promise<void>(function (res, rej) {
        openModal("confirmation-modal", {
          tagline: (
            <>
              Are you sure you want to cancel your appointment with{" "}
              <em>patient</em> <strong>{appointmentDoctor.name}</strong>
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
    <Card className="border-border flex flex-col gap-2">
      <Card.Header className="flex items-start justify-between">
        <Stack orientation="V">
          <Card.Title>Dr. {appointmentDoctor?.name}</Card.Title>
        </Stack>

        <Stack align="center" gap={12}>
          <span className="text-sm font-semibold whitespace-nowrap tracking-wide">
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

      <Card.Footer className="flex items-center justify-end self-end gap-3">
        {appointment.status === "active" && (
          <Button endIcon={<Trash />} size="xs" onClick={handleCancellation}>
            Cancel
          </Button>
        )}

        <Link
          to={`/app/workspace/patient/appointments/${appointment.id}`}
          className={getClassConfig({ size: "xs", color: "brand" })}
          aria-label={`View appointment with Dr. ${appointmentDoctor.name}`}
        >
          View <Eye aria-hidden="true" />
        </Link>
      </Card.Footer>
    </Card>
  );
}
