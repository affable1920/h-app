import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import SearchBar from "@/components/ui/SearchBar";
import { Stack } from "@/components/ui/Stack";
import { useSearchPaginate } from "@/hooks/use-search-paginate";
import type { DoctorOnboarding } from "@/schemas";
import useModalStore from "@/stores/modal-store";
import { SPECIALIZATIONS } from "@/utils/constants";
import { ChevronUp, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback } from "react";
import { useFormContext } from "react-hook-form";

export function Step3_Craft() {
  const form = useFormContext<DoctorOnboarding>();
  const { errors } = form.formState;

  const ps = form.watch("primary_specialization");
  const openModal = useModalStore((s) => s.openModal);

  const sortFn = useCallback(function (a: string, b: string) {
    return a.localeCompare(b);
  }, []);

  const filterFn = useCallback(function (item: string, query: string) {
    return item.toLowerCase().includes(query.toLowerCase().trim());
  }, []);

  const {
    query,
    search,
    items,
    iteration,
    hasNext,
    hasPrev,
    next,
    prev,
    reset,
    direction,
  } = useSearchPaginate(SPECIALIZATIONS, {
    sortFn,
    filterFn,
    max: 3,
  });

  return (
    <Stack orientation="V" gap="sm">
      <Stack orientation="V" gap="xs">
        <Stack orientation="V" gap={0}>
          <SearchBar
            id="primarySpecialization"
            label="primary specialization"
            placeholder="primary specialization"
            val={query}
            onChange={search}
            clearable={true}
            onClear={reset}
          />
          {errors["primary_specialization"] && (
            <div className="italic text-sm text-red-600 px-1">
              {errors["primary_specialization"]?.message}
            </div>
          )}
        </Stack>

        <Stack className="group/primary" orientation="V" gap="xs">
          <Stack justify="center" className="relative" align="center">
            <Button
              className="self-center opacity-0! group-hover/primary:opacity-100! transition-opacity duration-200"
              disabled={!hasPrev}
              onClick={prev}
              variant="icon"
            >
              <ChevronUp />
            </Button>

            <Button
              className="hover:underline underline-offset-4 text-xs absolute right-0 opacity-0 
              group-hover/primary:opacity-100 text-blue-500! hover:text-blue-400!"
              variant="icon"
              onClick={function () {
                openModal("picker", {
                  name: "primary_specialization",
                  items: SPECIALIZATIONS.sort(sortFn),
                  control: form.control,
                });
              }}
            >
              Check All
            </Button>
          </Stack>

          <AnimatePresence mode="wait">
            <motion.div
              key={iteration}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                scrollbarWidth: "none",
                maxHeight: "200px",
              }}
              exit={{
                y: direction === 1 ? -12.5 : 12.5,
                opacity: 0,
                transition: {
                  duration: 0.25,
                  ease: "easeOut",
                },
              }}
            >
              {items.map(function (spec) {
                return (
                  <label
                    key={spec}
                    htmlFor={spec}
                    className={`grow cursor-pointer inline-flex px-2 py-1 text-center items-center
                        justify-center rounded-md text-xs h-10 shadow-md shadow-black/10
                        ${
                          spec === ps
                            ? "bg-white text-layout-raised font-semibold"
                            : "bg-layout-raised text-text-normal"
                        }`}
                  >
                    <input
                      type="radio"
                      id={spec}
                      value={spec}
                      style={{ display: "none" }}
                      {...form.register("primary_specialization")}
                    />
                    {spec}
                  </label>
                );
              })}
            </motion.div>
          </AnimatePresence>

          <Button
            className="opacity-0 group-hover/primary:opacity-100 transition-opacity duration-200"
            onClick={next}
            disabled={!hasNext}
            variant="icon"
          >
            <ChevronDown />
          </Button>
        </Stack>
      </Stack>

      <Input
        size="sm"
        label="Secondary areas of focus"
        defaultValue={"dermatology, cardiology"}
        id="secondaryFocusAreas"
        placeholder="comma-separated"
        {...form.register("secondary_focus_areas")}
      />

      <div className="flex flex-col gap-2">
        <label className="capitalize px-1 text-sm">Professional Bio</label>
        <textarea
          {...form.register("bio")}
          style={{
            minHeight: 90,
            lineHeight: 1.3,
          }}
          id="bio"
          className={`placeholder:italic italic border-2 border-border-vivid p-2
          rounded-md focus:ring-2 focus:ring-accent/25 placeholder:text-sm`}
          placeholder="Share your approach to patient care, what drives you, or any specialised training…"
        />
      </div>
    </Stack>
  );
}
