import { useEffect } from "react";
import { useEvent } from "../../hooks/useEvents";
import { StatusBadge } from "../ui/StatusBadge";

type EventDetailsModalProps = {
  eventId: number;
  onClose: () => void;
};

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
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
              <DetailRow label="Status">
                <StatusBadge status={event.status} />
              </DetailRow>
            </dl>
          )}
        </div>
      </section>
    </div>
  );
}
