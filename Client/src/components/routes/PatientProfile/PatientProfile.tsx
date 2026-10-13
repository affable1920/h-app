import { useFetchProfile } from "@/hooks/use-auth";
import Divider from "@components/ui/Divider";
import { PageLayout } from "../PageLayout";
import { NavLink, Outlet } from "react-router-dom";
import { Stack } from "@/components/ui/Stack";
import { Avatar } from "@/components/ui/Avatar";
import ProgressBar from "@/components/ui/ProgressBar";

const TABS = [
  {
    label: "Appointments",
    route: "appointments",
  },
];

export function PatientProfile() {
  const { data: patient } = useFetchProfile<"patient">("patient");

  if (!patient) {
    return;
  }

  return (
    <PageLayout>
      <div className="bg-layout/20 mb-4 border border-border/80 rounded-xl shadow-md shadow-black/60 p-4 md:p-6">
        <Stack gap="sm" align="center">
          <Avatar
            name="image"
            initialSrc={null}
            id="dr-profile"
            onSave={function () {}}
            alt={patient.username}
          />
          <div className="flex-1 flex flex-col gap-2">
            <div>
              <h1 className="font-semibold text-text-normal text-md capitalize">
                {patient.username}
              </h1>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Profile Completion</span>
                <span className="font-medium text-blue-400">{70}%</span>
              </div>
              <ProgressBar
                maxProgress={70}
                removeOnFinish={false}
                flag={patient}
              />
            </div>
          </div>
        </Stack>
      </div>

      <Divider />

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

      <div className="mt-12">
        <Outlet context={patient} />
      </div>
    </PageLayout>
  );
}
