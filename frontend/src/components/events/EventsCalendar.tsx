import { useMemo, useState } from "react";
import { addHours, format, getDay, parse, startOfWeek } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import {
  Calendar,
  dateFnsLocalizer,
  type EventPropGetter,
  type View,
} from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useCancelEvent, useCancelSchedule } from "../../hooks/useEvents";
import type { Event, EventStatus } from "../../types/event.types";
import { EventDetailsModal } from "./EventDetailsModal";
import { StatusBadge } from "../ui/StatusBadge";

type EventsCalendarProps = {
  events: Event[];
};

type CalendarEvent = {
  title: string;
  start: Date;
  end: Date;
  resource: Event;
};

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const eventStyles: Record<
  EventStatus,
  { backgroundColor: string; borderColor: string; color: string }
> = {
  PENDING: {
    backgroundColor: "#fffdf9",
    borderColor: "#ff4f00",
    color: "#ff4f00",
  },
  ACTIVE: {
    backgroundColor: "#201515",
    borderColor: "#201515",
    color: "#fffefb",
  },
  CANCELLED_SCHEDULE: {
    backgroundColor: "#eceae3",
    borderColor: "#c5c0b1",
    color: "#36342e",
  },
  CANCELLED: {
    backgroundColor: "#fffefb",
    borderColor: "#b5b2aa",
    color: "#939084",
  },
};

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

function formatSelectedDate(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "full",
  }).format(date);
}

const eventPropGetter: EventPropGetter<CalendarEvent> = (calendarEvent) => {
  const style = eventStyles[calendarEvent.resource.status];

  return {
    style: {
      ...style,
      border: `1px solid ${style.borderColor}`,
      borderRadius: "5px",
      fontWeight: 600,
    },
  };
};

export function EventsCalendar({ events }: EventsCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<View>("month");
  const [selectedEventIds, setSelectedEventIds] = useState<number[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [detailsEventId, setDetailsEventId] = useState<number | null>(
    null,
  );
  const cancelSchedule = useCancelSchedule();
  const cancelEvent = useCancelEvent();

  const calendarEvents = useMemo(
    () =>
      events.map((event) => {
        const start = new Date(event.scheduledAt);

        return {
          title: event.title,
          start,
          end: addHours(start, 1),
          resource: event,
        };
      }),
    [events],
  );

  const selectedCalendarEvents = useMemo(
    () =>
      calendarEvents.filter((calendarEvent) =>
        selectedEventIds.includes(calendarEvent.resource.id),
      ),
    [calendarEvents, selectedEventIds],
  );

  const sortedSelectedEvents = useMemo(
    () =>
      [...selectedCalendarEvents].sort(
        (firstEvent, secondEvent) =>
          firstEvent.start.getTime() - secondEvent.start.getTime(),
      ),
    [selectedCalendarEvents],
  );

  const handleSelectEvent = (calendarEvent: CalendarEvent) => {
    setSelectedDate(calendarEvent.start);
    setSelectedEventIds([calendarEvent.resource.id]);
  };

  const handleShowMore = (dateEvents: CalendarEvent[], date: Date) => {
    setSelectedDate(date);
    setSelectedEventIds(dateEvents.map((dateEvent) => dateEvent.resource.id));
  };

  const handleNavigate = (date: Date) => {
    setCurrentDate(date);
  };

  const handleView = (view: View) => {
    setCurrentView(view);
  };

  return (
    <section className="space-y-4">
      <div className="h-calendar rounded-content border border-sand bg-cream p-4">
        <Calendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          date={currentDate}
          view={currentView}
          defaultDate={currentDate}
          views={["month", "week", "day"]}
          eventPropGetter={eventPropGetter}
          doShowMoreDrillDown={false}
          onNavigate={handleNavigate}
          onView={handleView}
          onSelectEvent={handleSelectEvent}
          onShowMore={handleShowMore}
        />
      </div>

      {selectedDate && sortedSelectedEvents.length > 0 && (
        <div className="rounded-content border border-sand bg-cream p-4">
          <div className="border-b border-sand/50 pb-3">
            <h2 className="text-card-title font-semibold text-zapier-black">
              {formatSelectedDate(selectedDate)}
            </h2>
            <p className="mt-1 text-sm font-medium text-warm-gray">
              {sortedSelectedEvents.length}{" "}
              {sortedSelectedEvents.length === 1 ? "event" : "events"}
            </p>
          </div>

          <div className="divide-y divide-sand/50">
            {sortedSelectedEvents.map((calendarEvent) => {
              const event = calendarEvent.resource;
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
              const errorMessage = scheduleError || eventError;
              const canCancelEvent = event.status !== "CANCELLED";

              return (
                <div
                  key={event.id}
                  className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="min-w-0 space-y-2">
                    <button
                      type="button"
                      className="wrap-break-word text-left text-card-title font-semibold text-zapier-orange underline-offset-4 transition hover:text-zapier-black hover:underline focus:outline-none focus:ring-2 focus:ring-zapier-orange focus:ring-offset-2 focus:ring-offset-cream"
                      onClick={() => setDetailsEventId(event.id)}
                    >
                      {event.title}
                    </button>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-dark-charcoal">
                      <StatusBadge status={event.status} />
                      <span>{formatScheduledAt(event.scheduledAt)}</span>
                    </div>
                    {event.description && (
                      <p className="wrap-break-word text-sm text-dark-charcoal">
                        {event.description}
                      </p>
                    )}
                    {errorMessage && (
                      <p className="rounded-content border border-zapier-orange bg-off-white px-3 py-2 text-sm font-medium text-dark-charcoal">
                        {errorMessage}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2">
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
                        {isCancellingEvent ? "Cancelling..." : "Cancel Event"}
                      </button>
                    )}
                    {!canCancelEvent && (
                      <span
                        className="text-sm text-warm-gray"
                        aria-label="No available actions"
                      >
                        &mdash;
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {detailsEventId !== null && (
        <EventDetailsModal
          eventId={detailsEventId}
          onClose={() => setDetailsEventId(null)}
        />
      )}
    </section>
  );
}
