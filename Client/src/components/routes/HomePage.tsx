import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Bot,
  CalendarCheck,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Video,
} from "lucide-react";
import { keepPreviousData } from "@tanstack/react-query";
import { useMemo, useState, type FormEvent } from "react";

import Button from "../ui/Button";
import Badge from "../ui/Badge";
import Spinner from "../ui/Spinner";
import Ratings from "../Ratings";
import { Stack } from "../ui/Stack";
import { useDoctors } from "@/hooks/use-doctors";
import type { Doctor } from "@/types/http";

const carePaths = [
  {
    title: "Find verified doctors",
    text: "Search by specialty, concern, availability, or doctor name.",
    icon: Stethoscope,
    to: "idx/doctors",
  },
  {
    title: "Book real slots",
    text: "See available schedules and move from discovery to appointment.",
    icon: CalendarCheck,
    to: "idx/doctors?currentlyAvailable=1",
  },
  {
    title: "Ask the care copilot",
    text: "Describe what you need and let the assistant guide the next step.",
    icon: Bot,
    to: "chat",
  },
];

const specialties = [
  "Cardiology",
  "Dermatology",
  "Orthopedics",
  "Gynecology",
  "Pediatrics",
  "General Medicine",
];

const stats = [
  { label: "Verified network", value: "Local care" },
  { label: "Booking flow", value: "Live slots" },
  { label: "Care help", value: "AI ready" },
];

function DoctorPreview({ doctor }: { doctor: Doctor }) {
  return (
    <Link
      to={`doctor/${doctor.id}`}
      className="group flex min-w-0 items-center justify-between gap-4 rounded-md border-2 border-border bg-layout p-4 shadow-md shadow-black/20 transition-colors hover:border-border-vivid hover:bg-layout-raised"
    >
      <Stack orientation="V" gap="xs" className="min-w-0">
        <Stack align="center" gap="xs">
          <h3 className="truncate text-sm text-text-normal group-hover:text-text">
            Dr. {doctor.name}
          </h3>
          <ShieldCheck
            size={12}
            className={doctor.verified ? "text-green-400" : "text-text-teritiary"}
          />
        </Stack>
        <p className="truncate text-xs capitalize text-text-teritiary">
          {doctor.primarySpecialization}
          {doctor.experience ? ` | ${doctor.experience} years` : ""}
        </p>
      </Stack>

      <Stack align="center" gap="xs" className="shrink-0">
        {!!doctor.rating && <Ratings rating={doctor.rating} />}
        <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
      </Stack>
    </Link>
  );
}

function HomePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const {
    data: { entities: doctors = [] } = {},
    isFetching,
    isError,
  } = useDoctors(
    {
      max: 3,
      sortColumn: "rating",
      sortOrder: "desc",
    },
    {
      placeholderData: keepPreviousData,
      staleTime: 1000 * 60 * 5,
    },
  );

  const visibleDoctors = useMemo(() => doctors.slice(0, 3), [doctors]);

  function handleSearch(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();

    const trimmed = query.trim();
    if (!trimmed) {
      navigate("idx/doctors");
      return;
    }

    const params = new URLSearchParams({
      searchQuery: trimmed,
      page: "1",
    });

    navigate(`idx/doctors?${params.toString()}`);
  }

  return (
    <section className="space-y-10 pb-10">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:items-stretch">
        <article className="flex min-h-[28rem] flex-col justify-between rounded-md border-2 border-border bg-layout p-6 shadow-lg shadow-black/20 md:p-8">
          <div className="space-y-6">
            <Badge
              as="span"
              full={false}
              color="primary"
              className="gap-2 px-3 py-2 text-xs"
            >
              <Sparkles size={12} />
              Patient care, guided from one place
            </Badge>

            <div className="max-w-3xl space-y-4">
              <h1 className="max-w-2xl text-2xl leading-tight text-text md:text-[2rem]">
                Fast care across a verified local network.
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-text-secondary md:text-md">
                Search doctors, compare trust signals, find availability, and
                use the AI care copilot when you want help choosing the next
                step.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSearch}
            className="mt-8 flex flex-col gap-3 rounded-md border-2 border-border-strong bg-background p-3 md:flex-row md:items-center"
          >
            <label className="flex min-w-0 flex-1 items-center gap-3 rounded-md bg-layout-raised px-4 py-3 focus-within:ring-4 focus-within:ring-brand/20">
              <Search size={16} className="shrink-0 text-text-teritiary" />
              <input
                value={query}
                onChange={(ev) => setQuery(ev.currentTarget.value)}
                placeholder="Search symptom, specialty, doctor, or clinic"
                className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-text-normal outline-none placeholder:text-text-teritiary"
              />
            </label>

            <Button
              type="submit"
              color="brand"
              size="md"
              border={false}
              endIcon={<ArrowRight />}
              className="md:self-stretch"
            >
              Find care
            </Button>
          </form>
        </article>

        <aside className="rounded-md border-2 border-border bg-background p-5 shadow-lg shadow-black/20">
          <Stack orientation="V" gap="sm">
            <header className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-md text-text">Recommended doctors</h2>
                <p className="text-xs text-text-teritiary">
                  Live from your directory
                </p>
              </div>
              {isFetching && <Spinner />}
            </header>

            {isError ? (
              <p className="rounded-md bg-layout p-4 text-sm text-text-secondary">
                Doctor previews are unavailable right now. Search still works.
              </p>
            ) : visibleDoctors.length ? (
              <Stack orientation="V" gap="xs">
                {visibleDoctors.map((doctor) => (
                  <DoctorPreview key={doctor.id} doctor={doctor} />
                ))}
              </Stack>
            ) : (
              <p className="rounded-md bg-layout p-4 text-sm text-text-secondary">
                Add doctors to the directory and they will appear here.
              </p>
            )}

            <Link to="idx/doctors">
              <Button className="w-full" color="white" border={false}>
                Open doctor directory
              </Button>
            </Link>
          </Stack>
        </aside>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {stats.map((item) => (
          <article
            key={item.label}
            className="rounded-md border-2 border-border bg-layout p-5"
          >
            <p className="text-xs uppercase text-text-teritiary">{item.label}</p>
            <h2 className="mt-1 text-lg text-text-normal">{item.value}</h2>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <article className="rounded-md border-2 border-border bg-layout p-6">
          <Stack orientation="V" gap="md">
            <div>
              <h2 className="text-xl text-text">Start with what you need</h2>
              <p className="mt-2 max-w-xl leading-6 text-text-secondary">
                The app introduces itself through the care journey: choose a
                path, narrow the network, then book or ask for help.
              </p>
            </div>

            <div className="grid gap-3">
              {carePaths.map(({ title, text, icon: Icon, to }) => (
                <Link
                  key={title}
                  to={to}
                  className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-md border-2 border-border-strong bg-background p-4 transition-colors hover:border-border-vivid"
                >
                  <span className="flex size-10 items-center justify-center rounded-md bg-layout-raised text-indicator">
                    <Icon size={18} />
                  </span>
                  <span className="min-w-0">
                    <strong className="block text-sm text-text-normal">
                      {title}
                    </strong>
                    <span className="block text-xs leading-5 text-text-teritiary">
                      {text}
                    </span>
                  </span>
                  <ArrowRight
                    size={14}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
              ))}
            </div>
          </Stack>
        </article>

        <article className="rounded-md border-2 border-border bg-layout p-6">
          <Stack orientation="V" gap="md">
            <div>
              <h2 className="text-xl text-text">Explore local specialties</h2>
              <p className="mt-2 leading-6 text-text-secondary">
                Quick routes into the directory keep the showcase useful even
                before a patient knows exactly who to book.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {specialties.map((specialty) => {
                const params = new URLSearchParams({
                  specialization: specialty.toLowerCase(),
                  page: "1",
                });

                return (
                  <Link key={specialty} to={`idx/doctors?${params.toString()}`}>
                    <Badge full={false} color="primary" className="px-4">
                      {specialty}
                    </Badge>
                  </Link>
                );
              })}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-md bg-background p-4">
                <Video size={18} className="mb-3 text-indicator" />
                <h3 className="text-sm text-text-normal">Online consults</h3>
                <p className="mt-1 text-xs leading-5 text-text-teritiary">
                  Move from discovery to video care when a doctor supports it.
                </p>
              </div>
              <div className="rounded-md bg-background p-4">
                <MapPin size={18} className="mb-3 text-indicator" />
                <h3 className="text-sm text-text-normal">Local clinics</h3>
                <p className="mt-1 text-xs leading-5 text-text-teritiary">
                  Keep in-person care connected to real clinics and locations.
                </p>
              </div>
            </div>
          </Stack>
        </article>
      </section>
    </section>
  );
}

export default HomePage;
