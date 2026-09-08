import { EditableField } from "@/components/lib/EditableField";
import type { ProfileResponse } from "@/types/http";
import { useCallback } from "react";
import { useOutletContext } from "react-router-dom";

export function PersonalProfileTab() {
  const doctor = useOutletContext<ProfileResponse<"doctor">>();

  const handleSave = useCallback(function (key: string, val: unknown) {}, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 grow">
      <div
        className="md:col-span-2 bg-layout/20 border border-border/50 rounded-xl p-6 space-y-6 shadow-sm 
      shadow-black/20"
      >
        <div className="space-y-0.5">
          <h3 className="font-semibold text-text-normal text-lg">
            Account Credentials
          </h3>
          <p className="text-sm">
            Manage core personal and practice identifiers verified by clients.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <span className="text-sm font-semibold uppercase text-blue-400">
              Full Practitioner Name
            </span>
            <EditableField
              name="name"
              initialValue={doctor.name}
              onSave={handleSave}
            />
          </div>

          <div className="space-y-2">
            <span className="text-sm font-semibold uppercase text-blue-400">
              Clinic Email Address
            </span>
            <EditableField
              name="email"
              initialValue={"Not Provided"}
              onSave={handleSave}
            />
          </div>
        </div>
      </div>

      <div className="bg-layout/20 border border-border/50 rounded-xl p-6 space-y-6 shadow-sm shadow-black/20">
        <h4 className="font-semibold text-text-normal">System Activity</h4>
        <div className="space-y-6">
          <div className="flex justify-between">
            <span>License Verification</span>
            {doctor.verified ? (
              <div className="text-green-400 font-medium">Active</div>
            ) : (
              <div className="text-red-400 font-medium">Not Verified</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
