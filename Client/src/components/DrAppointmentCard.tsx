import { Ban, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { getClassConfig } from "./lib/button/styles";
import Button from "./lib/button/Button";
import Badge from "./ui/Badge";
import Card from "./ui/Card";
import type { APIError } from "@/types/http";
import useModalStore from "@/stores/modal-store";
import { useCancelAppointment } from "@/hooks/use-doctors";
import { toast } from "sonner";
import type { components } from "@/types/api";
import type { AppointmentStatus } from "@/types/appointment";
import { cn } from "@/utils/utils";

export type AppointmentDoctorResponse =
  components["schemas"]["AppointmentDoctorResponse"];

const statusPresentation: Record<
  AppointmentStatus,
  { label: string; classes: string }
> = {
  active: {
    label: "Active",
    classes: "border-indicator/25 bg-indicator/10 text-indicator",
  },
  completed: {
    label: "Completed",
    classes: "border-emerald-300/25 bg-emerald-300/10 text-emerald-300",
  },
  cancelled: {
    label: "Cancelled",
    classes: "bg-layout-raised",
  },
  missed: {
    label: "Missed",
    classes: "border-amber-300/25 bg-amber-300/10 text-amber-300",
  },
};

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
        <Card.Title className="text-base">
          {appointment.patient?.name ?? appointment.patient?.username}
        </Card.Title>

        <Badge
          size="xs"
          as="span"
          className={cn(
            "font-black px-2",
            statusPresentation[appointment.status].classes,
          )}
          color={appointment.status === "active" ? "indicator" : "secondary"}
        >
          {appointment.status}
        </Badge>
      </Card.Header>

      <Card.Footer className="flex items-center justify-end gap-2">
        {appointment.status === "active" && (
          <Button
            size="xs"
            data-tooltip="cancel"
            aria-label={`Cancel appointment with ${appointment.patient.name ?? appointment.patient.username ?? "patient"}`}
            onClick={handleCancellation}
          >
            Cancel <Ban />
          </Button>
        )}

        <Link
          to={`/app/workspace/doctor/appointments/${appointment.id}`}
          className={getClassConfig({ size: "xs", color: "white" })}
          aria-label={`View appointment with ${appointment.patient.name ?? appointment.patient.username ?? "patient"}`}
        >
          View <Eye aria-hidden="true" />
        </Link>
      </Card.Footer>
    </Card>
  );
}
