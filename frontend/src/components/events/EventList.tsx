import { EventsCalendar } from "./EventsCalendar";
import { EventsFiltersForm } from "./EventsFiltersForm";
import { EventsTable } from "./EventsTable";
import type { Event, EventStatus } from "../../types/event.types";

type EventsView = "table" | "calendar";
type EventStatusFilter = EventStatus | "";

type EventListProps = {
  events: Event[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  hasActiveFilters: boolean;
  view: EventsView;
  statusFilter: EventStatusFilter;
  fromFilter: string;
  toFilter: string;
  eventStatuses: EventStatus[];
  onViewChange: (view: EventsView) => void;
  onStatusChange: (status: EventStatusFilter) => void;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onResetFilters: () => void;
};

export function EventList({
  events,
  isLoading,
  isError,
  error,
  hasActiveFilters,
  view,
  statusFilter,
  fromFilter,
  toFilter,
  eventStatuses,
  onViewChange,
  onStatusChange,
  onFromChange,
  onToChange,
  onResetFilters,
}: EventListProps) {
  return (
    <section className="rounded-content border border-sand/50 bg-cream">
      <div className="flex flex-col gap-5 border-b border-sand/50 px-6 py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-card-title font-semibold text-zapier-black">
              All Events
            </h2>
            <p className="mt-1 text-sm font-medium text-warm-gray">
              {hasActiveFilters
                ? `${events.length} ${events.length === 1 ? "event" : "events"} match the current filters.`
                : "Filter events by status or scheduled time."}
            </p>
          </div>

          <div
            className="inline-flex w-fit gap-3 rounded-lg border border-sand/50 bg-cream p-1 sm:ml-auto"
            aria-label="Events view"
          >
            {(["table", "calendar"] as const).map((viewOption) => (
              <button
                key={viewOption}
                type="button"
                className={`rounded-md px-4 py-3 text-base font-medium capitalize text-zapier-black transition ${
                  view === viewOption
                    ? "shadow-tab-active"
                    : "hover:bg-light-sand hover:shadow-tab-hover"
                }`}
                aria-pressed={view === viewOption}
                onClick={() => onViewChange(viewOption)}
              >
                {viewOption === "table" ? "Table" : "Calendar"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6">
        {isLoading && (
          <p className="text-sm font-medium text-warm-gray">
            Loading events...
          </p>
        )}

        {isError && (
          <p className="rounded-content border border-zapier-orange bg-off-white px-3 py-2 text-sm font-medium text-dark-charcoal">
            {error?.message ?? "Something went wrong while loading events."}
          </p>
        )}

        {!isLoading && !isError && events.length === 0 && (
          <p className="text-sm font-medium text-warm-gray">
            {hasActiveFilters
              ? "No events match these filters."
              : "No events yet."}
          </p>
        )}

        {!isLoading && !isError && events.length > 0 && (
          <>
            <EventsFiltersForm
              statusFilter={statusFilter}
              fromFilter={fromFilter}
              toFilter={toFilter}
              hasActiveFilters={hasActiveFilters}
              eventStatuses={eventStatuses}
              onStatusChange={onStatusChange}
              onFromChange={onFromChange}
              onToChange={onToChange}
              onReset={onResetFilters}
            />
            <div className="mt-4">
              {view === "table" ? (
                <EventsTable events={events} />
              ) : (
                <EventsCalendar events={events} />
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
