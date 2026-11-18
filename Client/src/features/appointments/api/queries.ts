import { queryOptions, useQuery } from "@tanstack/react-query";
import APIClient from "@/core/ApiClient";
import type { APIError } from "@/types/http";
import type { Role } from "@/types/user";
import type {
  AppointmentDoctorResponse,
  AppointmentPatientResponse,
} from "@/types/appointment";

export type AppointmentDetail =
  | { role: "doctor"; appointment: AppointmentDoctorResponse }
  | { role: "patient"; appointment: AppointmentPatientResponse };

const doctorApi = new APIClient("/doctors/me/appointments");
const patientApi = new APIClient("/patients/me/appointments");

export function useAppointmentDetail(
  role: Role,
  participantId: string | undefined,
  appointmentId: string,
) {
  return useQuery<AppointmentDetail, APIError>(
    appointmentDetailOptions({ role, participantId, appointmentId }),
  );
}

export function appointmentDetailOptions({
  role,
  participantId,
  appointmentId,
}: {
  role: Role;
  participantId: string | undefined;
  appointmentId: string;
}) {
  return queryOptions<AppointmentDetail, APIError, AppointmentDetail>({
    queryKey: ["appointments", "detail", role, participantId, appointmentId],
    queryFn: async function () {
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
    retry: (failureCount, error) =>
      ![401, 403, 404, 422].includes(error.statusCode) && failureCount < 1,
  });
}
