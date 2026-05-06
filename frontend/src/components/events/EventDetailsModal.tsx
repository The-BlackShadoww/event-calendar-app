import { useEffect } from "react";
import {
  useCancelEvent,
  useCancelSchedule,
  useDeleteEvent,
  useEvent,
} from "../../hooks/useEvents";
import type { Event } from "../../types/event.types";
import {
  formatDateTime,
  formatTicketPrice,
  truncateLocation,
} from "../../utils/eventFormatters";
import { AccessibilityBadge } from "../ui/AccessibilityBadge";
import { ApprovalBadge } from "../ui/ApprovalBadge";
import { StatusBadge } from "../ui/StatusBadge";

type EventDetailsModalProps = {
  eventId: number;
  onClose: () => void;
};

function LocationDisplay({ event }: { event: Event }) {
  if (event.locationType === "ONLINE") {
    return (
      <span className="inline-flex max-w-xs items-center gap-1">
        <span aria-hidden="true">🔗</span>
        <a
          className="truncate text-zapier-orange underline-offset-4 hover:text-zapier-black hover:underline"
          href={event.locationValue}
          rel="noreferrer"
          target="_blank"
          title={event.locationValue}
        >
          {truncateLocation(event.locationValue)}
        </a>
      </span>
    );
  }

  return (
    <span className="inline-flex max-w-xs items-center gap-1">
      <span aria-hidden="true">📍</span>
      <span className="truncate" title={event.locationValue}>
        {event.locationValue}
      </span>
    </span>
  );
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1 border-b border-sand/50 py-3 last:border-b-0 sm:grid-cols-[150px_1fr] sm:gap-4">
      <dt className="text-micro font-semibold uppercase tracking-label text-warm-gray">
        {label}
      </dt>
      <dd className="min-w-0 wrap-break-word text-sm font-medium text-dark-charcoal">
        {children}
      </dd>
    </div>
  );
}

export function EventDetailsModal({
  eventId,
  onClose,
}: EventDetailsModalProps) {
  const { data: event, isLoading, isError, error } = useEvent(eventId);
  const cancelSchedule = useCancelSchedule();
  const cancelEvent = useCancelEvent();
  const deleteEvent = useDeleteEvent();
  const isCancellingSchedule =
    cancelSchedule.isPending && cancelSchedule.variables === eventId;
  const isCancellingEvent =
    cancelEvent.isPending && cancelEvent.variables === eventId;
  const isDeletingEvent =
    deleteEvent.isPending && deleteEvent.variables === eventId;
  const scheduleError =
    cancelSchedule.isError && cancelSchedule.variables === eventId
      ? cancelSchedule.error?.message
      : undefined;
  const eventError =
    cancelEvent.isError && cancelEvent.variables === eventId
      ? cancelEvent.error?.message
      : undefined;
  const deleteError =
    deleteEvent.isError && deleteEvent.variables === eventId
      ? deleteEvent.error?.message
      : undefined;
  const actionError = scheduleError ?? eventError ?? deleteError;
  const canCancelEvent =
    event?.status !== "CANCELLED" && event?.status !== "COMPLETED";

  useEffect(() => {
    const handleKeyDown = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-overlay-dark px-4 py-6"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        aria-labelledby="event-details-title"
        aria-modal="true"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-content border border-sand bg-cream shadow-xl"
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-sand/50 px-5 py-4">
          <div className="min-w-0">
            <p className="text-micro font-semibold uppercase tracking-label text-warm-gray">
              Event details
            </p>
            <h2
              id="event-details-title"
              className="mt-1 wrap-break-word text-card-title font-semibold text-zapier-black"
            >
              {event?.title ?? "Loading event..."}
            </h2>
          </div>

          <button
            type="button"
            className="shrink-0 rounded-content border border-sand bg-light-sand px-3 py-2 text-sm font-semibold text-dark-charcoal transition hover:bg-sand hover:text-zapier-black"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="px-5 py-4">
          {isLoading && (
            <p className="text-sm font-medium text-warm-gray">
              Loading event details...
            </p>
          )}

          {isError && (
            <p className="rounded-content border border-zapier-orange bg-off-white px-3 py-2 text-sm font-medium text-dark-charcoal">
              {error.message}
            </p>
          )}

          {event && (
            <dl>
              <DetailRow label="ID">{event.id}</DetailRow>
              <DetailRow label="Title">{event.title}</DetailRow>
              <DetailRow label="Description">
                {event.description || "No description"}
              </DetailRow>
              <DetailRow label="Scheduled At">
                {formatDateTime(event.scheduledAt)}
              </DetailRow>
              <DetailRow label="End At">
                {formatDateTime(event.endedAt)}
              </DetailRow>
              <DetailRow label="Status">
                <StatusBadge status={event.status} />
              </DetailRow>
              <DetailRow label="Ticket">{formatTicketPrice(event)}</DetailRow>
              <DetailRow label="Capacity">
                {event.capacity ?? "Unlimited"}
              </DetailRow>
              <DetailRow label="Accessibility">
                <AccessibilityBadge isPublic={event.isPublic} />
              </DetailRow>
              <DetailRow label="Location">
                <LocationDisplay event={event} />
              </DetailRow>
              {event.coverImageUrl && (
                <DetailRow label="Cover Image">
                  <img
                    alt={`${event.title} cover`}
                    className="max-h-20 rounded-content border border-sand/50 object-cover"
                    src={event.coverImageUrl}
                  />
                </DetailRow>
              )}
              {event.requiresApproval && (
                <DetailRow label="Approval">
                  <ApprovalBadge />
                </DetailRow>
              )}
              <DetailRow label="Actions">
                <div className="flex flex-wrap items-center gap-2">
                  {event.status === "PENDING" && (
                    <button
                      type="button"
                      className="rounded-md border border-sand bg-light-sand px-3 py-1.5 text-xs font-semibold text-dark-charcoal transition hover:bg-sand hover:text-zapier-black disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={isCancellingSchedule}
                      onClick={() => cancelSchedule.mutate(event.id)}
                    >
                      {isCancellingSchedule
                        ? "Cancelling..."
                        : "Cancel Schedule"}
                    </button>
                  )}
                  {canCancelEvent && (
                    <button
                      type="button"
                      className="rounded-md border border-zapier-black bg-zapier-black px-3 py-1.5 text-xs font-semibold text-cream transition hover:bg-sand hover:text-zapier-black disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={isCancellingEvent}
                      onClick={() => cancelEvent.mutate(event.id)}
                    >
                      {isCancellingEvent ? "Cancelling..." : "Cancel Event"}
                    </button>
                  )}
                  <button
                    type="button"
                    className="rounded-md border border-red-700 bg-cream px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-700 hover:text-cream disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isDeletingEvent}
                    onClick={() =>
                      deleteEvent.mutate(event.id, {
                        onSuccess: onClose,
                      })
                    }
                  >
                    {isDeletingEvent ? "Deleting..." : "Delete Event"}
                  </button>
                </div>
                {actionError && (
                  <p className="mt-2 rounded-content border border-zapier-orange bg-off-white px-3 py-2 text-sm font-medium text-dark-charcoal">
                    {actionError}
                  </p>
                )}
              </DetailRow>
            </dl>
          )}
        </div>
      </section>
    </div>
  );
}
