import { fromISO } from "@/utils/utils";
import { Phone, Ban, Info } from "lucide-react";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import Card from "../ui/Card";
import { Stack } from "../ui/Stack";
import type { AppointmentDoctorResponse } from "@/types/http";
import useModalStore from "@/stores/modal-store";

export function DrAppointmentCard({
  appointment,
}: {
  appointment: AppointmentDoctorResponse;
}) {
  const openModal = useModalStore((s) => s.openModal);

  return (
    <Card className="border-border">
      <Card.Header className="flex items-start justify-between">
        <Stack orientation="V">
          <Card.Title>
            {appointment.patient?.name ?? appointment.patient?.username}
          </Card.Title>

          <Stack orientation="V" gap={1} className="tracking-wider">
            <h4 className="leading-[1.1] opacity-70">Appointment Reason</h4>
            <Card.Description className="text-sm">
              {appointment.careJourney?.reasonForVisit ?? "No Reason provided"}
            </Card.Description>
          </Stack>
        </Stack>

        <Stack align="center">
          <span className="m-0 inline-flex text-sm font-semibold">
            {fromISO(appointment.scheduledDate).toFormat("dd LLL yyyy")}
          </span>

          <Badge
            size="xs"
            full={false}
            className="font-black"
            disabled={appointment.status !== "active"}
            color={appointment.status === "active" ? "indicator" : "secondary"}
          >
            {appointment.status}
          </Badge>
        </Stack>
      </Card.Header>

      <Card.Footer
        className="flex items-center justify-end gap-2"
        selfAlign="end"
      >
        <Button
          className="opacity-70 hover:opacity-100 transition-opacity duration-150 
                    text-text-secondary hover:text-blue-400"
          variant="icon"
          bg={true}
          data-tooltip="contact"
        >
          <Phone />
        </Button>

        {appointment.status === "active" && (
          <Button
            className="opacity-70 hover:opacity-100 transition-opacity duration-150 
            text-text-secondary hover:text-red-700"
            variant="icon"
            bg={true}
            data-tooltip="cancel"
          >
            <Ban />
          </Button>
        )}

        <Button
          bg={true}
          onClick={function () {
            openModal("information-modal", {
              children: (
                <div className="min-h-40 p-4 space-y-3">
                  <header className="text-center font-semibold">
                    <h2 className="text-md">Appointment Details</h2>
                  </header>
                  <div className="flex flex-col items-center gap-2 text-center">
                    <Stack align="center" gap={12}>
                      <span className="text-text-teritiary font-bold">
                        Created at
                      </span>{" "}
                      -
                      <span>
                        {fromISO(appointment.createdAt).toFormat(
                          "dd LLL yy '@' HH:mm",
                        )}
                      </span>
                    </Stack>
                  </div>
                </div>
              ),
            });
          }}
          data-tooltip="more info"
          variant="icon"
          className="opacity-70 hover:opacity-100 transition-opacity duration-150 
                    text-text-secondary hover:text-text"
        >
          <Info />
        </Button>
      </Card.Footer>
    </Card>
  );
}
