import type { EventStatus } from "../../types/event.types";

type EventStatusFilter = EventStatus | "";

type EventsFiltersFormProps = {
  statusFilter: EventStatusFilter;
  fromFilter: string;
  toFilter: string;
  hasActiveFilters: boolean;
  eventStatuses: EventStatus[];
  onStatusChange: (status: EventStatusFilter) => void;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onReset: () => void;
};

export function EventsFiltersForm({
  statusFilter,
  fromFilter,
  toFilter,
  hasActiveFilters,
  eventStatuses,
  onStatusChange,
  onFromChange,
  onToChange,
  onReset,
}: EventsFiltersFormProps) {
  return (
    <form
      className="grid gap-4 lg:grid-cols-[minmax(10rem,1fr)_minmax(12rem,1fr)_minmax(12rem,1fr)_auto] lg:items-end"
      onSubmit={(event) => event.preventDefault()}
    >
      <label className="flex flex-col gap-2 text-sm font-semibold text-dark-charcoal">
        Status
        <select
          className="rounded-content border border-sand/50 bg-cream px-3 py-2 font-system-ui text-zapier-black outline-none transition focus:border-zapier-orange"
          value={statusFilter}
          onChange={(event) => onStatusChange(event.target.value as EventStatusFilter)}
        >
          <option value="">All statuses</option>
          {eventStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-2 text-sm font-semibold text-dark-charcoal">
        From
        <input
          type="datetime-local"
          className="rounded-content border border-sand/50 bg-cream px-3 py-2 font-system-ui text-zapier-black outline-none transition focus:border-zapier-orange"
          value={fromFilter}
          max={toFilter || undefined}
          onChange={(event) => onFromChange(event.target.value)}
        />
      </label>

      <label className="flex flex-col gap-2 text-sm font-semibold text-dark-charcoal">
        To
        <input
          type="datetime-local"
          className="rounded-content border border-sand/50 bg-cream px-3 py-2 font-system-ui text-zapier-black outline-none transition focus:border-zapier-orange"
          value={toFilter}
          min={fromFilter || undefined}
          onChange={(event) => onToChange(event.target.value)}
        />
      </label>

      <button
        type="button"
        className="w-fit rounded border border-sand bg-light-sand px-4 py-2 text-base font-semibold text-dark-charcoal transition hover:bg-sand hover:text-zapier-black disabled:cursor-not-allowed disabled:opacity-50"
        disabled={!hasActiveFilters}
        onClick={onReset}
      >
        Reset
      </button>
    </form>
  );
}
