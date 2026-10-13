import queryClient from "@/core/query-client";
import type { LoaderFunctionArgs } from "react-router-dom";
import {
  doctorOptions,
  getDoctorsOptions,
  parseDoctorParams,
} from "@/hooks/use-doctors";

export async function loaderDoctor({ params }: LoaderFunctionArgs) {
  await queryClient.ensureQueryData(doctorOptions(params.id!));
  return null;
}

export async function loaderDoctors({ request }: LoaderFunctionArgs) {
  const { searchParams: sp } = new URL(request.url);
  await queryClient.ensureQueryData(getDoctorsOptions(parseDoctorParams(sp)));

  return null;
}
