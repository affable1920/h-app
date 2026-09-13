import { EditableField } from "@components/lib/EditableField";
import Button from "@components/ui/Button";
import { useRequestEmailVerification } from "@hooks/use-auth";
import { useUpdateDoctor } from "@hooks/use-doctors";
import type { APIError, ProfileResponse } from "@/types/http";
import { Verified } from "lucide-react";
import { useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { toast } from "sonner";

export function PersonalProfileTab() {
  const doctor = useOutletContext<ProfileResponse<"doctor">>();

  const { mutateAsync: edit } = useUpdateDoctor();
  const { mutateAsync: requestEmailVerify, isPending } =
    useRequestEmailVerification();

  const handleSave = useCallback(
    async function (key: string, val: unknown) {
      return await edit({
        id: doctor.id,
        changes: {
          q: key,
          val: val,
        },
      });
    },
    [edit, doctor.id],
  );

  async function requestEmailVerification() {
    try {
      const message = await requestEmailVerify(null);
      toast.info(message);
    } catch (e) {
      const exc = e as unknown as APIError;
      toast.error(exc.code ?? "Email Verification failed.", {
        description() {
          return exc.message ?? "Please check you email for any possible typos";
        },
      });
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div
        className="md:col-span-2 bg-layout/20 border border-border/80 rounded-xl p-4 md:p-6 space-y-6 
        shadow-md shadow-black/40 min-w-0"
      >
        <header className="space-y-0.5">
          <h3 className="font-semibold text-text-normal text-md">
            Account Credentials
          </h3>
          <p className="text-sm">
            Manage core personal and practice identifiers verified by clients.
          </p>
        </header>

        <div className="flex flex-col md:flex-row gap-4 md:gap-12 md:items-start min-w-0">
          <div className="space-y-1 min-w-0">
            <span
              className="text-sm font-semibold uppercase text-blue-400 inline-flex m-0 
            leading-tight"
            >
              Full Name
            </span>
            <EditableField
              name="name"
              initialValue={doctor.name}
              onSave={handleSave}
            />
          </div>

          <div>
            {doctor.emailVerified ? (
              <div className="min-w-0 space-y-1">
                <span
                  className="text-sm font-semibold uppercase text-blue-400 
                inline-flex leading-tight m-0"
                >
                  Email Address
                </span>
                <div className="flex py-0.5 truncate font-semibold text-text-normal">
                  {doctor.email}
                </div>
              </div>
            ) : (
              <div className="min-w-0 space-y-1">
                <span className="inline-flex gap-2 items-center m-0">
                  <span className="inline-flex items-center gap-1.5 m-0">
                    <span className="text-sm font-semibold uppercase text-blue-400">
                      Email Address
                    </span>
                    <span
                      className="text-red-400"
                      data-tooltip="Email not verified"
                    >
                      <Verified size={10} />
                    </span>
                  </span>
                  <Button
                    onClick={requestEmailVerification}
                    size="xs"
                    loading={isPending}
                    border={false}
                    data-tooltip="Verify email"
                    disabled={isPending}
                    className="shrink-0 scale-80"
                  >
                    Verify
                  </Button>
                </span>

                <EditableField
                  name="email"
                  initialValue={doctor.email}
                  onSave={handleSave}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className="bg-layout/20 border border-border/80 rounded-xl p-4 md:p-6 space-y-6 
      shadow-md shadow-black/40"
      >
        <header className="space-y-0.5">
          <h3 className="font-semibold text-text-normal text-md">
            System Activity
          </h3>
        </header>
        <div className="space-y-6">
          <div className="flex items-baseline justify-between gap-4 font-semibold">
            <span
              className="text-blue-400 uppercase text-sm inline-flex m-0 
            leading-tight min-w-0"
            >
              License Verification
            </span>
            <div
              className={`shrink-0 font-medium 
                ${doctor.verified ? "text-green-400" : "text-red-400"}
              `}
            >
              {doctor.verified ? "Verified" : "Not Verified"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
