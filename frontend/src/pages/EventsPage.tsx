import { useMemo, useState } from "react";
import { EventCreateForm } from "../components/events/EventCreateForm";
import { EventList } from "../components/events/EventList";
import { useEvents } from "../hooks/useEvents";
import type {
  EventStatus,
  EventsView,
  HomeContentView,
  EventStatusFilter,
} from "../types/event.types";
import { toBangladeshIsoDateTime } from "../utils/eventFormatters";

const EVENT_STATUSES: EventStatus[] = [
  "PENDING",
  "ACTIVE",
  "CANCELLED_SCHEDULE",
  "CANCELLED",
];

export function EventsPage() {
  const [view, setView] = useState<EventsView>("table");
  const [homeContentView, setHomeContentView] =
    useState<HomeContentView>("list");
  const [statusFilter, setStatusFilter] = useState<EventStatusFilter>("");
  const [fromFilter, setFromFilter] = useState("");
  const [toFilter, setToFilter] = useState("");

  const eventFilters = useMemo(
    () => ({
      status: statusFilter || undefined,
      from: toBangladeshIsoDateTime(fromFilter),
      to: toBangladeshIsoDateTime(toFilter),
    }),
    [fromFilter, statusFilter, toFilter],
  );

  const hasActiveFilters = Boolean(statusFilter || fromFilter || toFilter);
  const {
    data: events = [],
    isLoading,
    isError,
    error,
  } = useEvents(eventFilters);

  const resetFilters = () => {
    setStatusFilter("");
    setFromFilter("");
    setToFilter("");
  };

  return (
    <main className="min-h-screen bg-cream px-4 py-10 font-sans text-zapier-black sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto flex max-w-page flex-col gap-8">
        <header className="flex flex-col gap-6 border-b border-sand/50 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-display-sm font-medium text-zapier-black sm:text-display">
              Events
            </h1>
            <p className="mt-4 max-w-2xl text-body-lg font-normal text-dark-charcoal">
              {homeContentView === "form"
                ? "Create a new event."
                : "Review schedules and switch between table and calendar views."}
            </p>
          </div>
          <button
            type="button"
            className="w-fit rounded-lg border border-zapier-orange bg-zapier-orange px-4 py-2 text-sm font-semibold text-cream transition hover:border-zapier-black hover:bg-zapier-black"
            onClick={() =>
              setHomeContentView((currentView) =>
                currentView === "list" ? "form" : "list",
              )
            }
          >
            {homeContentView === "list" ? "Create Event" : "Event List"}
          </button>
        </header>
        {homeContentView === "form" ? (
          <EventCreateForm />
        ) : (
          <EventList
            events={events}
            isLoading={isLoading}
            isError={isError}
            error={error}
            hasActiveFilters={hasActiveFilters}
            view={view}
            statusFilter={statusFilter}
            fromFilter={fromFilter}
            toFilter={toFilter}
            eventStatuses={EVENT_STATUSES}
            onViewChange={setView}
            onStatusChange={setStatusFilter}
            onFromChange={setFromFilter}
            onToChange={setToFilter}
            onResetFilters={resetFilters}
          />
        )}
      </div>
    </main>
  );
}
