import Button from "@/components/lib/button/Button";
import Badge from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import SearchBar from "@/components/ui/SearchBar";
import { Stack } from "@/components/ui/Stack";
import { useSearchPaginate } from "@/hooks/use-search-paginate";
import type { DoctorOnboarding } from "@/schemas";
import useModalStore from "@/stores/modal-store";
import { SPECIALIZATIONS } from "@/utils/constants";
import { ChevronUp, ChevronDown, Asterisk } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback } from "react";
import { useController, useFormContext } from "react-hook-form";

export function Step3_Craft() {
  const form = useFormContext<DoctorOnboarding>();
  const { errors } = form.formState;

  const openModal = useModalStore((s) => s.openModal);

  const sortFn = useCallback(function (a: string, b: string) {
    return a.localeCompare(b);
  }, []);

  const filterFn = useCallback(function (item: string, query: string) {
    return item.toLowerCase().includes(query.toLowerCase().trim());
  }, []);

  const { field: ps } = useController({
    name: "primary_specialization",
    control: form.control,
    rules: {
      required: "Primary specialization is required",
    },
  });

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
    <Stack orientation="V" gap="md">
      <Stack orientation="V" gap="sm">
        <Stack orientation="V" gap={0}>
          <label
            aria-invalid={Boolean(errors["primary_specialization"])}
            className="px-1 text-sm mb-2 font-semibold inline-flex m-0 gap-0.5"
            htmlFor="primary-specialization"
          >
            Primary Specialization <Asterisk size={10} />
          </label>
          <SearchBar
            id="primary-specialization"
            placeholder="search for a specialization .."
            value={query}
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

        <Stack className="group/primary" orientation="V" gap="sm">
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
                openModal("picker-modal", {
                  name: "primary_specialization",
                  items: SPECIALIZATIONS.sort(sortFn),
                  onSelect: ps.onChange,
                  selected: ps.value,
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
                const isSelected = spec === ps.value;
                return (
                  <Badge
                    as="label"
                    key={spec}
                    htmlFor={spec}
                    selected={isSelected}
                    size="sm"
                    className={`grow focus-within:ring-3 focus-within:ring-brand/20`}
                  >
                    <input
                      type="radio"
                      id={spec}
                      name={ps.name}
                      value={spec}
                      checked={isSelected}
                      onChange={function () {
                        ps.onChange(spec);
                      }}
                      className="sr-only"
                      onBlur={ps.onBlur}
                    />
                    <span>{spec}</span>
                  </Badge>
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

      <Input.Group error={errors.secondary_focus_areas?.message}>
        <Input.Label required={false} htmlFor="secondary-focus-areas">
          Secondary areas of focus
        </Input.Label>
        <Input.Element
          defaultValue={"dermatology, cardiology"}
          id="secondary-focus-areas"
          placeholder="comma-separated"
          {...form.register("secondary_focus_areas")}
        />
      </Input.Group>

      <div className="flex flex-col gap-2">
        <label htmlFor="bio" className="capitalize px-1 text-sm font-semibold">
          Professional Bio
        </label>
        <textarea
          {...form.register("bio")}
          style={{
            minHeight: 90,
            lineHeight: 1.3,
          }}
          id="bio"
          className={`placeholder:italic italic border-2 border-border-vivid p-2
          rounded-lg focus:ring-2 focus:ring-accent/25 placeholder:text-sm`}
          placeholder="Share your approach to patient care, what drives you, or any specialised training…"
        />
      </div>
    </Stack>
  );
}
