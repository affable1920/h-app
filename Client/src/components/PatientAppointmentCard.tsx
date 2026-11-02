import Button from "./lib/button/Button";
import Badge from "@components/ui/Badge";
import Card from "@components/ui/Card";
import type { APIError } from "@/types/http";
import useModalStore from "@/stores/modal-store";
import { useCancelAppointment } from "@/hooks/use-doctors";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { getClassConfig } from "./lib/button/styles";
import type { AppointmentPatientResponse } from "@/types/appointment";
import { statusPresentation } from "@/utils/constants";
import { cn } from "@/utils/utils";

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
    <Card key={appointment.id} className="border-border flex flex-col gap-2">
      <Card.Header className="flex items-start justify-between">
        <Card.Title className="text-base">
          Dr. {appointment.doctor.name}
        </Card.Title>

        <Badge
          size="xs"
          as="span"
          className={cn(
            "font-black px-2",
            statusPresentation[appointment.status].classes,
          )}
        >
          {appointment.status}
        </Badge>
      </Card.Header>

      <Card.Footer className="flex items-center justify-end gap-3">
        {appointment.status === "active" && (
          <Button
            size="xs"
            color="secondary"
            data-tooltip="cancel"
            aria-label={`Cancel appointment with ${appointment.doctor.name}`}
            onClick={handleCancellation}
          >
            Cancel
          </Button>
        )}

        <Link
          to={`/app/workspace/patient/appointments/${appointment.id}`}
          className={getClassConfig({ size: "xs", color: "white" })}
          aria-label={`View appointment with ${appointment.doctor.name}`}
        >
          View
        </Link>
      </Card.Footer>
    </Card>
  );
}
