import queryClient from "@/core/query-client";
import type { LoaderFunctionArgs } from "react-router-dom";
import {
  doctorOptions,
  getDoctorsOptions,
  parseDoctorParams,
} from "@/hooks/use-doctors";
import useAuthStore from "@/stores/auth-store";
import { appointmentDetailOptions } from "@/features/appointments/api/queries";

export async function loaderDoctor({ params }: LoaderFunctionArgs) {
  await queryClient.ensureQueryData(doctorOptions(params.id!));
  return null;
}

export async function loaderDoctors({ request }: LoaderFunctionArgs) {
  const { searchParams: sp } = new URL(request.url);
  return await queryClient.ensureQueryData(
    getDoctorsOptions(parseDoctorParams(sp)),
  );
}

export async function loaderAppointment({ params }: LoaderFunctionArgs) {
  const { user, role } = useAuthStore.getState();

  if (!(user && role)) {
    throw new Error("User not authenticated ..");
  }

  if (!params.appointmentId) {
    throw new Error("No appointment ID in route params");
  }

  return await queryClient.ensureQueryData(
    appointmentDetailOptions({
      role,
      participantId: user.id,
      appointmentId: params.appointmentId,
    }),
  );
}
