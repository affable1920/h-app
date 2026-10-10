import { useGetClinics } from "@/hooks/use-clinics";
import { useGetDoctorClinics } from "@/hooks/use-doctors";
import { useState } from "react";
import { useAssociateDoctorClinic } from "../api/mutations";
import type { APIError } from "@/types/http";
import { toast } from "sonner";
import Spinner from "@/components/ui/Spinner";
import Card from "@/components/ui/Card";
import { Stack } from "@/components/ui/Stack";
import Button from "@/components/lib/button/Button";
import { Select } from "@/components/ui/SelectApi";

export function DoctorClinicsTab() {
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);

  const {
    data: { entities: linkedClinics = [] } = {},
    isPending: linkedClinicsPending,
    isError: linkedClinicsError,
  } = useGetDoctorClinics({ max: 100 });

  const {
    data: { entities: allClinics = [] } = {},
    isPending: allClinicsPending,
    isError: allClinicsError,
  } = useGetClinics({ max: 100 });

  const { mutateAsync: associateClinic, isPending: isAssociating } =
    useAssociateDoctorClinic();

  if (linkedClinicsPending || allClinicsPending) {
    return <Spinner />;
  }

  if (linkedClinicsError || allClinicsError) {
    return (
      <p className="text-red-400">
        Clinics could not be loaded. Please try again ..
      </p>
    );
  }

  const linkedClinicIds = new Set(
    linkedClinics.map(function (clinic) {
      return clinic.id;
    }),
  );

  const availableClinics = allClinics.filter(function (clinic) {
    return !linkedClinicIds.has(clinic.id);
  });

  async function handleAssociation() {
    if (!selectedClinicId) {
      return;
    }

    try {
      await associateClinic({
        clinicId: selectedClinicId,
      });

      setSelectedClinicId(null);
      toast.success("Clinic added to your profile ..");
    } catch (ex) {
      const apiError = ex as APIError;

      toast.error(apiError.code, {
        description: apiError.message,
      });
    }
  }

  return (
    <section className="space-y-8">
      <Card>
        <Card.Header className="space-y-0.5">
          <Card.Title>Add an existing clinic</Card.Title>
          <Card.Description>
            Choose a clinic where you currently practise.
          </Card.Description>
        </Card.Header>

        <Card.Body>
          <Stack orientation="V" gap="sm">
            <Select
              label={
                availableClinics.length
                  ? "Choose clinic"
                  : "All available clinics are already linked"
              }
              options={availableClinics.map(function (clinic) {
                return {
                  label: `${clinic.name} — ${clinic.location}`,
                  value: clinic.id,
                };
              })}
              selected={selectedClinicId}
              onValueChange={function (next) {
                setSelectedClinicId(typeof next === "string" ? next : null);
              }}
            />

            <Button
              disabled={!selectedClinicId}
              loading={isAssociating}
              onClick={handleAssociation}
            >
              Add clinic
            </Button>
          </Stack>
        </Card.Body>
      </Card>

      <section className="space-y-4">
        <h2 className="text-md font-semibold text-text-normal">Your clinics</h2>

        {linkedClinics.length === 0 ? (
          <p>You have not added any clinics yet.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {linkedClinics.map(function (clinic) {
              return (
                <Card key={clinic.id}>
                  <Card.Header>
                    <Card.Title>{clinic.name}</Card.Title>
                    <Card.Description>{clinic.location}</Card.Description>
                  </Card.Header>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </section>
  );
}
