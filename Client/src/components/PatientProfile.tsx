import { useFetchProfile } from "@/hooks/use-auth";
import ProfileShell from "./ProfileShell";

export function PatientProfile() {
  const {
    data: profile,
    isError,
    isLoading,
    refetch,
  } = useFetchProfile("patient");

  console.log(profile);

  return (
    <ProfileShell isError={isError} isPending={isLoading} refetch={refetch}>
      <div>{profile?.name}</div>
    </ProfileShell>
  );
}
