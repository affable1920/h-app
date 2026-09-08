import { Avatar } from "@/components/ui/Avatar";
import ProgressBar from "@/components/ui/ProgressBar";
import { useUpdateDoctor } from "@/hooks/use-doctors";
import { useMemo, useCallback } from "react";
import { toast } from "sonner";
import ProfileShell from "../../ProfileShell";
import { Stack } from "../../ui/Stack";
import { useFetchProfile } from "@/hooks/use-auth";
import { NavLink, Outlet } from "react-router-dom";
import { PageLayout } from "../PageLayout";

const TABS = [
  {
    label: "Personal Profile",
    route: "personal",
  },
  {
    label: "Schedules",
    route: "schedules",
  },
  {
    label: "Settings",
    route: "settings",
  },
  {
    label: "Preferences",
    route: "preferences",
  },
];

export function DrProfile() {
  const { data: doctor, isError, isLoading } = useFetchProfile("doctor");
  const { mutate: edit } = useUpdateDoctor();

  const progress = useMemo(
    function () {
      if (!doctor) {
        return 0;
      }

      const N = Object.keys(doctor).length;
      const D = Object.values(doctor).filter(Boolean).length;

      const prcnt = Math.ceil((D / N) * 100);
      return prcnt;
    },
    [doctor],
  );

  const handleEdit = useCallback(function handleEdit(
    field: string,
    val: unknown,
  ) {
    return edit(
      {
        id: doctor?.id!,
        changes: {
          q: field,
          val,
        },
      },
      {
        onError(error) {
          toast.error(error.code, {
            description() {
              return error.message;
            },
            className: "capitalize",
          });
        },
      },
    );
  }, []);

  if (!doctor) {
    return null;
  }

  return (
    <ProfileShell isError={isError} isPending={isLoading}>
      <PageLayout>
        <div className="bg-layout/20 border border-border-strong/40 rounded-xl shadow-md shadow-black/20 p-4">
          <Stack gap="sm" align="center">
            <Avatar
              name="image"
              onSave={handleEdit}
              initialSrc={doctor.imageUrl!}
              id="dr-profile"
              alt={`Dr. ${doctor.name}`}
            />
            <div className="flex-1 flex flex-col gap-2">
              <div>
                <h1 className="font-bold text-text-normal text-md">
                  Dr. {doctor.name}
                </h1>
                <p className="text-sm mt-0.5 text-text-normal">
                  {doctor.primarySpecialization}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Profile Completion</span>
                  <span className="font-medium text-blue-400">{progress}%</span>
                </div>
                <ProgressBar
                  maxProgress={progress}
                  removeOnFinish={false}
                  flag={doctor}
                />
              </div>
            </div>
          </Stack>
        </div>

        <div className="border-b border-border/40 sticky top-0 bg-background/80 backdrop-blur-md z-10 mt-8">
          <nav
            className="flex space-x-8 overflow-x-auto justify-between"
            aria-label="Tabs"
          >
            {TABS.map((tab) => (
              <NavLink
                key={tab.label}
                to={tab.route}
                className={({ isActive }) => `
                  py-3 px-1 inline-flex items-center text-sm font-medium border-b-2 whitespace-nowrap 
                  transition-all duration-200
                  ${
                    isActive
                      ? "border-white text-white"
                      : "border-transparent text-text-secondary hover:text-text-normal hover:border-border"
                  }
                `}
              >
                {tab.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <Stack className="mt-8">
          <Outlet context={doctor} />
        </Stack>
      </PageLayout>
    </ProfileShell>
  );
}
