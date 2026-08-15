import { useFetchProfile, useRemoveAccount } from "@/hooks/use-auth";
import ProfileShell from "./ProfileShell";
import Spinner from "./ui/Spinner";
import { Stack } from "./ui/Stack";
import { useCallback, useEffect, useRef, useState } from "react";
import Button from "./ui/Button";
import useModalStore from "@/stores/modal-store";
import { Delete, Edit, Plus, Settings } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { logout } from "@/stores/auth-store";
import Divider from "./ui/Divider";

export function DrProfile() {
  const openModal = useModalStore((s) => s.openModal);

  const { data: profile, isError, isLoading } = useFetchProfile("doctor");
  const { mutate: removeAccount } = useRemoveAccount("doctor");

  const [show, setShow] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(
    function () {
      if (!profile) {
        return;
      }

      const $ = (id: string) => document.getElementById(id);

      let wrapper = $("progress-box"),
        bar = $("progress-bar"),
        label = $("progress-label"),
        progress = 0;

      if (!wrapper || !bar || !label) {
        return;
      }

      wrapper.style.display = "block";
      wrapper.style.height = "6px";

      const N = Object.keys(profile).length;
      const D = Object.values(profile).filter(Boolean).length;
      const completedPercentage = Math.ceil((D / N) * 100);

      const interval = setInterval(function () {
        progress += Math.random() + 12;
        bar.style.width = progress + "%";
        label.innerText = completedPercentage + "%";

        if (progress >= completedPercentage) {
          bar.style.width = completedPercentage + "%";

          if (label) {
            label.innerText = completedPercentage + "%";
          }
          clearInterval(interval);
          return;
        }

        bar.style.width = progress + "%";
      }, 80);
    },
    [profile],
  );

  const setTimer = useCallback(
    function () {
      timerRef.current = setTimeout(function () {
        setShow(false);
      }, 120);
    },
    [show],
  );

  if (!profile) {
    return;
  }

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <ProfileShell isError={isError} isPending={isLoading}>
      <Stack orientation="V" gap="sm">
        <Stack orientation="V" gap="sm">
          <Stack className="relative" justify="between">
            <Stack gap="sm" justify="center" align="end">
              {profile.imageUrl ? (
                <div className="aspect-square rounded-full overflow-hidden size-32">
                  <img
                    className="h-full w-full cursor-pointer object-cover"
                    src={profile?.imageUrl}
                    alt={`Dr. ${profile.name}`}
                  />
                </div>
              ) : null}
              <Stack align="center" className="group/name">
                <h1
                  className="text-lg capitalize text-text-normal 
                group-hover/name:text-text group-hover/name:cursor-pointer"
                >
                  Dr. {profile?.name}
                </h1>
                <Button
                  data-tooltip="edit your name"
                  className="opacity-75 hover:opacity-100 transition-opacity duration-150"
                  variant="icon"
                >
                  <Edit />
                </Button>
              </Stack>
            </Stack>

            {show && (
              <motion.div
                onMouseEnter={function () {
                  if (timerRef.current) {
                    clearTimeout(timerRef.current);
                    timerRef.current = null;
                  }
                }}
                onMouseLeave={setTimer}
                animate={{
                  opacity: show ? 1 : 0,
                  y: show ? 0 : 5,
                  pointerEvents: show ? "all" : "none",
                }}
                className="flex flex-col gap-4 p-2 rounded-md absolute right-8 bottom-0"
              >
                <Button
                  onClick={function () {
                    openModal("confirmation", {
                      tagline: "Are you sure you want to delete your account ?",
                      resolve() {
                        removeAccount(profile.id, {
                          onSuccess() {
                            toast("You account was successfully deleted !", {
                              description() {
                                return "logging out ...";
                              },
                            });

                            logout("/");
                          },
                          onError(ex) {
                            console.log(ex);
                            toast.error("Your account could not be deleted !");
                          },
                        });
                      },
                      reject() {},
                    });
                  }}
                  endIcon={<Delete />}
                >
                  delete account
                </Button>
              </motion.div>
            )}

            <Stack align="end">
              <Button
                onMouseEnter={function () {
                  setShow(true);
                }}
                onMouseLeave={setTimer}
                variant="icon"
                bg={true}
                color={"secondary"}
              >
                <Settings />
              </Button>
            </Stack>
          </Stack>
          <Stack className="mx-4" align="center">
            <div
              id="progress-box"
              className="relative w-full bg-layout-raised overflow-hidden rounded-md shadow-sm 
              shadow-black/50 p-0.5"
            >
              <div
                id="progress-bar"
                className="w-0 h-full bg-brand rounded-md"
              />
            </div>
            <span id="progress-label" />
          </Stack>
        </Stack>

        <section className="mt-10 space-y-4">
          <Stack justify="between" align="center">
            <h2 className="text-lg text-text-normal">Schedules</h2>
            <Stack>
              <Button
                onClick={function () {
                  openModal("create-schedule", {
                    doctor: profile,
                  });
                }}
                variant="icon"
                bg={true}
              >
                <Plus />
              </Button>
              <Button variant="icon" bg={true}>
                <Edit />
              </Button>
            </Stack>
          </Stack>

          <section>
            {!!profile.schedules.length ? (
              profile.schedules.map(function (s) {
                return <span>{s.id}</span>;
              })
            ) : (
              <Stack justify="center">
                <h2 className="text-text-secondary text-md">
                  No schedules yet!
                </h2>
              </Stack>
            )}
          </section>
        </section>
      </Stack>
    </ProfileShell>
  );
}
