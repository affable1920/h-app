import {
  useEditProfile,
  useFetchProfile,
  useRemoveAccount,
} from "@/hooks/use-auth";
import ProfileShell from "./ProfileShell";
import Spinner from "./ui/Spinner";
import { Stack } from "./ui/Stack";
import { useCallback, useEffect, useRef, useState } from "react";
import Button from "./ui/Button";
import useModalStore from "@/stores/modal-store";
import { Delete, Edit, Plus, Save, Settings, X } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { logout } from "@/stores/auth-store";

export function DrProfile() {
  const openModal = useModalStore((s) => s.openModal);

  const { mutate: edit } = useEditProfile();
  const { mutate: removeAccount } = useRemoveAccount("doctor");
  const { data: profile, isError, isLoading } = useFetchProfile("doctor");

  const [show, setShow] = useState(false);
  const [isNameDirty, setIsNameDirty] = useState(false);
  const initialNameValue = profile?.name ?? "";

  const editorRef = useRef<HTMLDivElement>(null);
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

  function handleFocus() {
    const editButton = document.getElementById("edit-button");
    const saveButton = document.getElementById("save-button");

    if (!editButton || !saveButton) {
      return;
    }

    editButton.style.display = "none";
    saveButton.style.display = "block";

    const range = document.createRange();
    const selection = document.getSelection();

    const el = editorRef.current as HTMLDivElement;

    range.selectNodeContents(el);
    range.collapse(false);

    selection?.removeAllRanges();
    selection?.addRange(range);
  }

  function handleBlur() {
    const editButton = document.getElementById("edit-button");
    const saveButton = document.getElementById("save-button");

    if (!saveButton || !editButton) {
      return;
    }

    if (!isNameDirty) {
      saveButton.style.display = "none";
      editButton.style.display = "block";
    }
  }

  if (isLoading) {
    return <Spinner />;
  }

  if (!profile) {
    return;
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
                <div
                  ref={editorRef}
                  spellCheck={false}
                  translate="no"
                  role="textbox"
                  aria-multiline="false"
                  enterKeyHint="enter"
                  onInput={function (ev) {
                    setIsNameDirty(
                      ev.currentTarget.textContent?.trim() !==
                        profile.name.trim(),
                    );
                  }}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  defaultValue={profile.name}
                  className="text-md flex items-center gap-2 capitalize text-text-normal group-hover/name:text-text 
                  group-hover/name:cursor-pointer font-semibold outline-none focus:ring-2 hover:cursor-text 
                  focus:ring-blue-400/20 rounded-md focus:ring-offset-2 focus:ring-offset-blue-400/15 
                  px-3 py-1"
                >
                  {initialNameValue}
                </div>
                <Button
                  id="edit-button"
                  data-tooltip="Edit your name"
                  aria-label="edit-button"
                  className="opacity-75 hover:opacity-100 transition-opacity duration-150"
                  variant="icon"
                  size="sm"
                  onClick={function () {
                    if (editorRef.current) {
                      editorRef.current.contentEditable = "true";
                      editorRef.current.focus();
                    }
                  }}
                >
                  <Edit />
                </Button>
                <Stack align="center" gap={4}>
                  {isNameDirty && (
                    <Button
                      data-tooltip="Clear changes"
                      onClick={function () {
                        if (editorRef.current) {
                          editorRef.current.textContent = initialNameValue;
                          setIsNameDirty(false);
                        }
                      }}
                      variant="icon"
                    >
                      <X />
                    </Button>
                  )}
                  <Button
                    aria-label="save-button"
                    data-tooltip="save changes"
                    type="submit"
                    id="save-button"
                    variant="icon"
                    size="sm"
                    disabled={!isNameDirty}
                    onClick={function () {
                      edit(
                        {
                          fieldName: "name",
                          newValue: editorRef.current?.textContent,
                        },
                        {
                          onSuccess() {
                            setIsNameDirty(false);
                          },
                        },
                      );
                    }}
                    style={{ display: "none", marginLeft: "4px" }}
                  >
                    <Save />
                  </Button>
                </Stack>
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
                size="sm"
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
                size="sm"
              >
                <Plus />
              </Button>
              <Button size="sm" variant="icon" bg={true}>
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
                <h2 className="text-text-secondary text-[13px]">
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
