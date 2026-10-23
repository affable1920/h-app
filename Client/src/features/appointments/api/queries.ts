import { useQuery } from "@tanstack/react-query";
import APIClient from "@/core/ApiClient";
import type { APIError } from "@/types/http";
import type { Role } from "@/types/user";
import type {
  AppointmentDoctorResponse,
  AppointmentPatientResponse,
} from "@/types/appointment";
import { createQueryOptions } from "@/hooks/use-http";

export type AppointmentDetail =
  | { role: "doctor"; appointment: AppointmentDoctorResponse }
  | { role: "patient"; appointment: AppointmentPatientResponse };

const doctorApi = new APIClient("/doctors/me/appointments");
const patientApi = new APIClient("/patients/me/appointments");

export function useAppointmentDetail(
  role: Role,
  participantId: string | undefined,
  appointmentId: string | undefined,
) {
  return useQuery<AppointmentDetail, APIError>({
    queryKey: ["appointments", "detail", role, participantId, appointmentId],
    enabled: Boolean(participantId && appointmentId),
    async queryFn({ signal }) {
      if (!appointmentId) {
        throw new Error("An appointment ID is required.");
      }

      if (role === "doctor") {
        const response = await doctorApi.get<AppointmentDoctorResponse>(
          appointmentId,
          { signal },
        );

        return { role, appointment: response.data };
      }

      const response = await patientApi.get<AppointmentPatientResponse>(
        appointmentId,
        { signal },
      );

      return { role, appointment: response.data };
    },
    retry: (failureCount, error) =>
      ![401, 403, 404, 422].includes(error.status) && failureCount < 1,
  });
}

export const appointmentDetailOptions = createQueryOptions(
  ({
    role,
    participantId,
    appointmentId,
  }: {
    role: Role;
    participantId: string;
    appointmentId: string;
  }) => ["appointments", "detail", role, participantId, appointmentId],
  async function ({ role, appointmentId }) {
    if (!appointmentId) {
      throw new Error("An appointment ID is required.");
    }

    if (role === "doctor") {
      const response =
        await doctorApi.get<AppointmentDoctorResponse>(appointmentId);

      return { role, appointment: response.data };
    }

    const response =
      await patientApi.get<AppointmentPatientResponse>(appointmentId);

    return { role, appointment: response.data };
  },
);
