import { useState } from "react";
import type { Event } from "../../types/event.types";
import {
  formatDateTime,
  formatTicketPrice,
  truncateLocation,
} from "../../utils/eventFormatters";
import { EventDetailsModal } from "./EventDetailsModal";
import { AccessibilityBadge } from "../ui/AccessibilityBadge";
import { StatusBadge } from "../ui/StatusBadge";

type EventsTableProps = {
  events: Event[];
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

export function EventsTable({ events }: EventsTableProps) {
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

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
                Scheduled At
              </th>
              <th scope="col" className="px-4 py-3">
                End At
              </th>
              <th scope="col" className="px-4 py-3">
                Status
              </th>
              <th scope="col" className="px-4 py-3">
                Ticket Price
              </th>
              <th scope="col" className="px-4 py-3">
                Accessibility
              </th>
              <th scope="col" className="px-4 py-3">
                Location
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sand/50">
            {events.map((event) => (
              <tr key={event.id} className="bg-cream text-zapier-black">
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
                <td className="whitespace-nowrap px-4 py-3 text-dark-charcoal">
                  {formatDateTime(event.scheduledAt)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-dark-charcoal">
                  {formatDateTime(event.endedAt)}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <StatusBadge status={event.status} />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-dark-charcoal">
                  {formatTicketPrice(event)}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <AccessibilityBadge isPublic={event.isPublic} />
                </td>
                <td className="px-4 py-3 text-dark-charcoal">
                  <LocationDisplay event={event} />
                </td>
              </tr>
            ))}
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
