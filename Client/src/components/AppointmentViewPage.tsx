import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  CalendarCheck2,
  Check,
  CircleAlert,
  Clock3,
  FileText,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Stethoscope,
  UserRound,
  Video,
  type LucideIcon,
  MapPinCheckIcon,
  Mail,
  Phone,
  Hospital,
} from "lucide-react";
import { PageLayout } from "./routes/PageLayout";
import Button from "./lib/button/Button";
import { cn } from "@/utils/utils";
import useAuthStore from "@/stores/auth-store";
import {
  useAppointmentDetail,
  type AppointmentDetail,
} from "@/features/appointments/api/queries";
import type { components } from "@/types/api";
import type { Role } from "@/types/user";
import { fromISO } from "@/domain/scheduling/utils";
import { useCall } from "@/features/call/core/use-call";
import { useAppointmentCompletion } from "@/features/appointments/api/mutations";
import type { APIError } from "@/types/http";
import { toast } from "sonner";
import useModalStore from "@/stores/modal-store";

type AppointmentStatus = components["schemas"]["AppointmentStatus"];

const statusPresentation: Record<
  AppointmentStatus,
  { label: string; classes: string; description: string }
> = {
  active: {
    label: "Active",
    classes: "border-indicator/25 bg-indicator/10 text-indicator",
    description: "Your appointment is active.",
  },
  completed: {
    label: "Completed",
    classes: "border-emerald-300/25 bg-emerald-300/10 text-emerald-300",
    description:
      "This appointment is marked as completed. Its details remain available for reference.",
  },
  cancelled: {
    label: "Cancelled",
    classes: "border-rose-300/25 bg-rose-300/10 text-rose-300",
    description:
      "This appointment was cancelled. These details are kept as part of your history.",
  },
  missed: {
    label: "Missed",
    classes: "border-amber-300/25 bg-amber-300/10 text-amber-300",
    description:
      "This appointment is marked as missed. These details are kept as part of your history.",
  },
};

const linkFocus = "focus-visible:outline-none";
const sectionStyle = "rounded-2xl border border-border-strong bg-layout/60";

export function AppointmentViewPage({ role }: { role: Role }) {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const participantId = useAuthStore((state) => state.user?.id);

  const { data, isPending, isError, error, refetch, isFetching } =
    useAppointmentDetail(role, participantId, appointmentId);

  const backTo = `/app/workspace/${role}/appointments`;

  return (
    <PageLayout className="max-w-7xl pb-16">
      <nav aria-label="Appointment navigation" className="mb-8">
        <Link
          to={backTo}
          className={cn(
            linkFocus,
            `inline-flex items-center gap-2 text-base text-text-secondary transition-colors hover:text-text 
            focus-visible:text-text-normal`,
          )}
        >
          <ArrowLeft size={13} aria-hidden="true" />
          Back to appointments
        </Link>
      </nav>

      {isPending ? (
        <AppointmentSkeleton />
      ) : isError || !data ? (
        <section
          className={cn(
            sectionStyle,
            "mx-auto max-w-xl px-6 py-14 text-center",
          )}
          aria-labelledby="appointment-error-title"
        >
          <CircleAlert
            className="mx-auto mb-4 text-text-secondary"
            size={32}
            aria-hidden="true"
          />
          <h1 id="appointment-error-title" className="text-xl">
            Appointment unavailable
          </h1>
          <p
            role="alert"
            className="mx-auto mt-3 max-w-sm text-base text-text-secondary"
          >
            {error?.status === 404 || error?.status === 403
              ? "This appointment could not be found, or is not available to your account."
              : error?.status === 422
                ? "This appointment link is not valid. Please open an appointment from your list."
                : "We couldn't load your appointment. Please check your connection and try again."}
          </p>
          {![403, 404, 422].includes(error?.status ?? 0) && (
            <Button
              className="mt-6"
              onClick={() => void refetch()}
              loading={isFetching}
              startIcon={<RefreshCw aria-hidden="true" />}
            >
              Try again
            </Button>
          )}
        </section>
      ) : (
        <AppointmentOverview detail={data} participantId={participantId} />
      )}
    </PageLayout>
  );
}

function AppointmentOverview({
  detail,
  participantId,
}: {
  detail: AppointmentDetail;
  participantId?: string;
}) {
  const { appointment, role } = detail;

  const scheduled = fromISO(appointment.scheduledDate).toLocal();
  const booked = fromISO(appointment.createdAt).toLocal();

  const end = scheduled.plus({ minutes: appointment.slot.duration });
  const status = statusPresentation[appointment.status];
  const doctor = detail.role === "patient" ? detail.appointment.doctor : null;
  const patient = detail.role === "doctor" ? detail.appointment.patient : null;
  const name = doctor
    ? `Dr. ${doctor.name}`
    : patient?.name || patient?.username || "Patient";
  const initial = (doctor?.name || patient?.name || patient?.username || "P")
    .trim()
    .charAt(0)
    .toUpperCase();

  const mode = appointment.slot.mode;

  const modeLabel =
    mode === "online"
      ? "Online"
      : mode === "in person"
        ? "In person"
        : mode === "hybrid"
          ? "Online or in person"
          : "Not specified";

  const hasReason = Boolean(appointment.careJourney?.reasonForVisit?.trim());

  const elements = useCall();
  const peerId = doctor ? doctor.id : patient ? patient.id : null;

  const { mutateAsync: markComplete, isPending } = useAppointmentCompletion();

  const openModal = useModalStore((s) => s.openModal);

  async function markAsComplete() {
    if (!participantId) {
      return;
    }

    try {
      await new Promise<void>(function (resolve, reject) {
        openModal("confirmation-modal", {
          tagline: "Did this consultation take place ?",
          onResolve() {
            resolve();
          },
          onReject() {
            reject();
          },
        });
      });
    } catch {
      return;
    }

    try {
      await markComplete({
        appointmentId: appointment.id,
        doctorId: participantId,
      });

      toast.success("Appointment marked as complete successfully!");
    } catch (ex) {
      const error = ex as APIError;
      toast.error(error.code, {
        description: error.message,
      });
    }
  }

  return (
    <article aria-labelledby="appointment-title" className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1
            id="appointment-title"
            tabIndex={-1}
            className="text-[26px] outline-none tracking-normal"
          >
            Appointment overview
          </h1>
          <p className="mt-1 text-base leading-relaxed text-text-secondary">
            {role === "doctor"
              ? "A little context before you meet your patient."
              : "Your visit, with all the details in one place."}
          </p>
        </div>
        <div className={cn("flex flex-col gap-2")}>
          <span
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold",
              status.classes,
            )}
          >
            {appointment.status === "completed" ? (
              <Check size={14} aria-hidden="true" />
            ) : (
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-current"
              />
            )}
            {status.label}
          </span>
          {appointment.status === "active" && detail.role === "doctor" && (
            <Button
              onClick={function () {
                markAsComplete();
              }}
              color="indicator"
              loading={isPending}
              size="xs"
            >
              Mark complete
            </Button>
          )}
        </div>
      </header>

      <section
        aria-labelledby="appointment-schedule-title"
        className="relative overflow-hidden rounded-2xl border border-brand/30 bg-gradient-to-br from-brand/15 via-layout to-layout"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full bg-brand/10 blur-3xl"
        />
        <div className="relative flex gap-6 p-6 sm:p-7">
          <div
            aria-hidden="true"
            className="flex h-28 w-24 shrink-0 flex-col items-center justify-center rounded-xl border 
            border-white/10 bg-background/30"
          >
            <span className="text-sm font-bold uppercase tracking-[0.15em] text-violet-200">
              {scheduled.toFormat("LLL")}
            </span>
            <span className="my-1 text-3xl font-bold leading-none text-text">
              {scheduled.toFormat("dd")}
            </span>
            <span className="text-sm text-text-secondary">
              {scheduled.toFormat("yyyy")}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h2
              id="appointment-schedule-title"
              className="mb-1 text-sm font-bold uppercase tracking-[0.18em] text-violet-200"
            >
              Scheduled appointment
            </h2>
            <time
              dateTime={appointment.scheduledDate}
              className="block text-xl font-bold leading-tight text-text"
            >
              {scheduled.toFormat("cccc, dd LLLL yyyy")}
            </time>
            <p className="mt-3 flex items-center gap-2 text-base text-text-normal">
              <Clock3
                size={14}
                className="text-violet-200"
                aria-hidden="true"
              />
              {scheduled.toFormat("h:mm a")} –{" "}
              {end.toFormat(
                end.hasSame(scheduled, "day") ? "h:mm a" : "d LLL, h:mm a",
              )}
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              Times shown in {scheduled.zoneName} ({scheduled.offsetNameShort}).
            </p>
          </div>
        </div>
        <dl
          className="relative grid divide-white/10 border-t border-white/10 bg-background/10 
        grid-cols-3 divide-x"
        >
          <OverviewFact
            icon={Clock3}
            label="Duration"
            value={`${appointment.slot.duration} minutes`}
          />
          <OverviewFact
            icon={mode === "online" ? Video : MapPin}
            label="Slot format"
            value={modeLabel}
          />
          <OverviewFact
            icon={CalendarCheck2}
            label="Booked on"
            value={booked.toFormat("d LLL yyyy")}
          />
        </dl>
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <section
            aria-labelledby="participant-title"
            className={cn(sectionStyle, "p-6 sm:p-7")}
          >
            <h2
              id="participant-title"
              className="mb-5 flex items-center gap-2 text-[14px]"
            >
              {role === "patient" ? (
                <Stethoscope
                  size={14}
                  className="text-violet-300"
                  aria-hidden="true"
                />
              ) : (
                <UserRound
                  size={14}
                  className="text-violet-300"
                  aria-hidden="true"
                />
              )}
              {role === "patient" ? "Your doctor" : "Your patient"}
            </h2>
            <div className="flex items-center gap-4">
              <span
                aria-hidden="true"
                className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-brand/20 bg-brand/10 text-xl font-bold text-violet-200"
              >
                {initial}
              </span>
              <div className="min-w-0">
                <h3 className="break-words text-[17px] tracking-[0.05em] capitalize">
                  {name}
                </h3>
                <p className="mt-1 break-words text-sm text-text-secondary">
                  {doctor ? (
                    doctor.primarySpecialization
                  ) : (
                    <a
                      href={`mailto:/${patient?.email}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 hover:underline underline-offset-4"
                    >
                      <Mail size={10} />
                      {patient?.email}
                    </a>
                  )}
                </p>
              </div>

              {appointment.status === "active" && (
                <Button
                  size="xs"
                  bg
                  variant="icon"
                  color="secondary"
                  data-tooltip="consult right now"
                  className="justify-self-end"
                  onClick={function () {
                    if (!peerId) {
                      return;
                    }

                    elements.initiate(peerId, appointment.id);
                  }}
                >
                  <Phone />
                </Button>
              )}
            </div>
            {doctor && (
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border-strong pt-4 text-sm">
                <span className="text-text-secondary">
                  {doctor.experience}{" "}
                  {doctor.experience === 1 ? "year" : "years"} of experience
                </span>
                <Link
                  to={`/app/index/doctors/${doctor.id}`}
                  className={cn(
                    linkFocus,
                    "inline-flex items-center gap-1.5 font-semibold text-violet-200 hover:text-text",
                  )}
                >
                  Doctor profile <ArrowUpRight size={12} aria-hidden="true" />
                </Link>
              </div>
            )}
          </section>

          <section
            aria-labelledby="visit-reason-title"
            className={cn(sectionStyle, "p-6 sm:p-7")}
          >
            <div className="mb-5 flex items-center gap-2">
              <FileText
                size={14}
                className="text-violet-300"
                aria-hidden="true"
              />
              <h2 id="visit-reason-title" className="text-[14px]">
                Reason for the visit
              </h2>
            </div>
            <p className="mb-3 text-base text-text-secondary">
              Provided when the appointment was booked.
            </p>
            <div className="rounded-xl border border-border-strong bg-background/35 p-5">
              <p
                className={cn(
                  "whitespace-pre-wrap break-words text-base",
                  hasReason ? "text-text-normal" : "italic text-text-secondary",
                )}
              >
                {hasReason
                  ? appointment.careJourney?.reasonForVisit
                  : "No reason for the visit was provided"}
                .
              </p>
            </div>
            <p className="mt-4 flex items-center gap-2 text-base leading-relaxed text-text-secondary">
              <ShieldCheck size={12} className="shrink-0" aria-hidden="true" />
              Appointment details are available to its doctor and patient.
            </p>
          </section>
        </div>

        <aside aria-label="Visit information" className="space-y-6">
          <section
            aria-labelledby="clinic-title"
            className={cn(sectionStyle, "p-6 sm:p-7")}
          >
            <h2
              id="clinic-title"
              className="mb-5 flex items-center gap-2 text-[14px]"
            >
              <Hospital
                size={14}
                className="text-violet-300"
                aria-hidden="true"
              />
              Clinic &amp; location
            </h2>
            <h3 className="break-words text-[17px]">
              {appointment.clinic.name}
            </h3>
            <Link
              className={cn(
                linkFocus,
                "inline-flex items-center mt-2 gap-1.5 whitespace-pre-wrap break-words text-base leading-tight font-semibold text-violet-200 hover:text-text hover:underline underline-offset-4",
              )}
              data-tooltip="Locate"
              to=""
            >
              <span>{appointment.clinic.location}</span>
              <MapPinCheckIcon size={12} />
            </Link>
            {mode === "online" && (
              <p className="mt-4 border-t border-border-strong pt-4 text-base leading-relaxed text-text-secondary">
                This slot is online. The clinic is listed as the appointment's
                associated location.
              </p>
            )}
            {mode === "hybrid" && (
              <p className="mt-4 border-t border-border-strong pt-4 text-base text-text-secondary">
                This slot supports online and in-person visits. A specific
                format is not recorded on this appointment.
              </p>
            )}
          </section>

          <section
            aria-labelledby="appointment-note-title"
            className="rounded-2xl border border-violet-300/15 bg-violet-300/5 p-6 sm:p-7"
          >
            <h2 id="appointment-note-title" className="mb-3 text-[14px]">
              {appointment.status === "active"
                ? "Before your appointment"
                : "Appointment record"}
            </h2>
            <p className="text-base leading-tight text-text-secondary">
              {appointment.status === "active"
                ? role === "doctor"
                  ? "Review the patient's reason for the visit and the scheduled details before you meet."
                  : "Keep your questions and any information you want to discuss ready for your doctor."
                : status.description}
            </p>
          </section>
        </aside>
      </div>

      <footer className="flex flex-col gap-2 border-t border-border-strong pt-3 text-sm leading-relaxed text-text-secondary sm:flex-row sm:items-start sm:justify-between">
        <p className="flex items-center gap-2 mx-auto font-semibold opacity-65 select-none">
          <CalendarDays size={12} aria-hidden="true" />
          {status.description}
        </p>
      </footer>
    </article>
  );
}

function OverviewFact({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1.2 items-center px-6 py-5 sm:px-8">
      <div className="flex items-center justify-center gap-1.5">
        <Icon
          size={10}
          className="shrink-0 text-text-secondary"
          aria-hidden="true"
        />
        <dt className="text-sm text-text-secondary font-semibold">{label}</dt>
      </div>

      <dd className="mt-1 text-base font-semibold text-text-normal text-center leading-tight">
        {value}
      </dd>
    </div>
  );
}

function AppointmentSkeleton() {
  return (
    <div aria-busy="true" className="space-y-6">
      <p role="status" className="sr-only">
        Loading appointment details …
      </p>
      <div aria-hidden="true" className="space-y-6 motion-safe:animate-pulse">
        <div className="h-12 w-2/3 rounded-xl bg-layout-raised" />
        <div className="h-64 rounded-2xl border border-border-strong bg-layout" />
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="h-72 rounded-2xl border border-border-strong bg-layout" />
          <div className="h-48 rounded-2xl border border-border-strong bg-layout" />
        </div>
      </div>
    </div>
  );
}
