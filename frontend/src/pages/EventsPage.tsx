import { useMemo, useState } from "react";
import { EventCreateForm } from "../components/events/EventCreateForm";
import { EventsCalendar } from "../components/events/EventsCalendar";
import { EventsFiltersForm } from "../components/events/EventsFiltersForm";
import { EventsTable } from "../components/events/EventsTable";
import { useEvents } from "../hooks/useEvents";
import type { EventStatus } from "../types/event.types";

type EventsView = "table" | "calendar";
type HomeContentView = "list" | "form";
type EventStatusFilter = EventStatus | "";

const BANGLADESH_TIMEZONE_OFFSET = "+06:00";
const EVENT_STATUSES: EventStatus[] = [
    "PENDING",
    "ACTIVE",
    "CANCELLED_SCHEDULE",
    "CANCELLED",
];

function toBangladeshIsoDateTime(value: string) {
    return value ? `${value}:00.000${BANGLADESH_TIMEZONE_OFFSET}` : undefined;
}

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
                        {homeContentView === "list"
                            ? "Create Event"
                            : "Event List"}
                    </button>
                </header>
                {homeContentView === "form" ? (
                    <EventCreateForm />
                ) : (
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
                                    {(["table", "calendar"] as const).map(
                                        (viewOption) => (
                                            <button
                                                key={viewOption}
                                                type="button"
                                                className={`rounded-md px-4 py-3 text-base font-medium capitalize text-zapier-black transition ${
                                                    view === viewOption
                                                        ? "shadow-tab-active"
                                                        : "hover:bg-light-sand hover:shadow-tab-hover"
                                                }`}
                                                aria-pressed={
                                                    view === viewOption
                                                }
                                                onClick={() =>
                                                    setView(viewOption)
                                                }
                                            >
                                                {viewOption === "table"
                                                    ? "Table"
                                                    : "Calendar"}
                                            </button>
                                        ),
                                    )}
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
                                    {error.message}
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
                                        eventStatuses={EVENT_STATUSES}
                                        onStatusChange={setStatusFilter}
                                        onFromChange={setFromFilter}
                                        onToChange={setToFilter}
                                        onReset={resetFilters}
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
                )}
            </div>
        </main>
    );
}
