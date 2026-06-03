import { useFetchProfile } from "@/hooks/use-auth";
import ProfileShell from "./ProfileShell";

export function DrProfile() {
  const {
    data: profile,
    isError,
    isLoading,
    refetch,
  } = useFetchProfile("doctor");
  return (
    <ProfileShell isError={isError} isPending={isLoading} refetch={refetch}>
      <div className="capitalize font-semibold text-lg">Dr {profile?.name}</div>

      <section className="profile-section personal-info">
        <header>Personal Information</header>
      </section>
    </ProfileShell>
  );
}
