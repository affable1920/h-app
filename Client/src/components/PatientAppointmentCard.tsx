import { fromISO } from "@/domain/scheduling/utils";
import { Ban, Eye } from "lucide-react";
import Button from "./lib/button/Button";
import Badge from "@components/ui/Badge";
import Card from "@components/ui/Card";
import { Stack } from "@components/ui/Stack";
import type { APIError } from "@/types/http";
import useModalStore from "@/stores/modal-store";
import { useCancelAppointment } from "@/hooks/use-doctors";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import type { components } from "@/types/api";

export type AppointmentPatientResponse =
  components["schemas"]["AppointmentPatientResponse"];

export function PatientAppointmentCard({
  appointment,
}: {
  appointment: AppointmentPatientResponse;
}) {
  const appointmentDoctor = appointment.doctor;
  const careJourney = appointment.careJourney;

  const openModal = useModalStore((s) => s.openModal);
  //   const closeModal = useModalStore((s) => s.closeModal);

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
    <Card className="border-border">
      <Card.Header className="flex items-start justify-between">
        <Stack orientation="V">
          <Card.Title>Dr. {appointmentDoctor?.name}</Card.Title>

          <Stack orientation="V" gap={4} className="tracking-wider">
            <h4 className="leading-[1.1] opacity-70">Appointment Reason</h4>
            <Card.Description className="text-sm leading-[1.2]">
              {careJourney?.reasonForVisit ?? "No Reason provided"}
            </Card.Description>
          </Stack>
        </Stack>

        <Stack align="center" gap={12}>
          <span className="text-sm font-semibold whitespace-nowrap tracking-wider">
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

      <Card.Footer className="flex items-center justify-end gap-3">
        {appointment.status === "active" && (
          <Button endIcon={<Ban />} size="xs" onClick={handleCancellation}>
            Cancel
          </Button>
        )}

        <Link to="">
          <Button size="xs" endIcon={<Eye />} color="brand">
            Preview{" "}
          </Button>
        </Link>
      </Card.Footer>
    </Card>
  );
}
