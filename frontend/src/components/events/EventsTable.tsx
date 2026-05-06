import { Fragment, useState } from "react";
import { useCancelEvent, useCancelSchedule } from "../../hooks/useEvents";
import type { Event } from "../../types/event.types";
import { EventDetailsModal } from "./EventDetailsModal";
import { StatusBadge } from "../ui/StatusBadge";

type EventsTableProps = {
  events: Event[];
};

const DESCRIPTION_LIMIT = 50;

function truncateDescription(description: string | null) {
  if (!description) {
    return "-";
  }

  if (description.length <= DESCRIPTION_LIMIT) {
    return description;
  }

  return `${description.slice(0, DESCRIPTION_LIMIT - 3)}...`;
}

function formatScheduledAt(scheduledAt: string) {
  const date = new Date(scheduledAt);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function EventsTable({ events }: EventsTableProps) {
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const cancelSchedule = useCancelSchedule();
  const cancelEvent = useCancelEvent();

  return (
    <>
      <div className="overflow-x-auto rounded-content border border-sand/50 bg-cream">
        <table className="min-w-full border-collapse text-left text-sm text-zapier-black">
          <thead>
            <tr className="border-b border-sand/50 bg-off-white text-micro font-semibold uppercase tracking-label text-dark-charcoal">
              <th scope="col" className="px-4 py-3">
                ID
              </th>
              <th scope="col" className="px-4 py-3">
                Title
              </th>
              <th scope="col" className="px-4 py-3">
                Description
              </th>
              <th scope="col" className="px-4 py-3">
                Scheduled At
              </th>
              <th scope="col" className="px-4 py-3">
                Status
              </th>
              <th scope="col" className="px-4 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sand/50">
            {events.map((event) => {
              const isCancellingSchedule =
                cancelSchedule.isPending &&
                cancelSchedule.variables === event.id;
              const isCancellingEvent =
                cancelEvent.isPending && cancelEvent.variables === event.id;
              const scheduleError =
                cancelSchedule.isError && cancelSchedule.variables === event.id
                  ? cancelSchedule.error?.message
                  : undefined;
              const eventError =
                cancelEvent.isError && cancelEvent.variables === event.id
                  ? cancelEvent.error?.message
                  : undefined;
              const errorMessage = scheduleError ?? eventError;
              const canCancelEvent = event.status !== "CANCELLED";

              return (
                <Fragment key={event.id}>
                  <tr className="bg-cream text-zapier-black">
                    <td className="whitespace-nowrap px-4 py-3 font-semibold">
                      {event.id}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        className="max-w-xs wrap-break-word text-left font-semibold text-zapier-orange underline-offset-4 transition hover:text-zapier-black hover:underline focus:outline-none focus:ring-2 focus:ring-zapier-orange focus:ring-offset-2 focus:ring-offset-cream"
                        onClick={() => setSelectedEventId(event.id)}
                      >
                        {event.title}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-dark-charcoal">
                      {truncateDescription(event.description)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-dark-charcoal">
                      {formatScheduledAt(event.scheduledAt)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <StatusBadge status={event.status} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex items-center gap-2">
                        {event.status === "PENDING" && (
                          <button
                            type="button"
                            className="rounded-lg border border-sand bg-light-sand px-4 py-2 text-sm font-semibold text-dark-charcoal transition hover:bg-sand hover:text-zapier-black disabled:cursor-not-allowed disabled:opacity-50"
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
                            className="rounded-lg border border-zapier-black bg-zapier-black px-4 py-2 text-sm font-semibold text-cream transition hover:bg-sand hover:text-zapier-black disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={isCancellingEvent}
                            onClick={() => cancelEvent.mutate(event.id)}
                          >
                            {isCancellingEvent
                              ? "Cancelling..."
                              : "Cancel Event"}
                          </button>
                        )}
                        {!canCancelEvent && (
                          <span
                            className="text-warm-gray"
                            aria-label="No available actions"
                          >
                            &mdash;
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                  {errorMessage && (
                    <tr className="bg-off-white">
                      <td
                        colSpan={6}
                        className="px-4 py-2 text-sm font-medium text-dark-charcoal"
                      >
                        {errorMessage}
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedEventId !== null && (
        <EventDetailsModal
          eventId={selectedEventId}
          onClose={() => setSelectedEventId(null)}
        />
      )}
    </>
  );
}
