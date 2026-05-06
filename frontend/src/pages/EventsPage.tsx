import { type FormEvent, useState } from 'react';
import { EventsCalendar } from '../components/events/EventsCalendar';
import { EventsTable } from '../components/events/EventsTable';
import { useCreateEvent, useEvents } from '../hooks/useEvents';

type EventsView = 'table' | 'calendar';

const BANGLADESH_TIMEZONE_OFFSET = '+06:00';

export function EventsPage() {
  const [view, setView] = useState<EventsView>('table');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');

  const { data: events = [], isLoading, isError, error } = useEvents();
  const createEvent = useCreateEvent();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    createEvent.mutate(
      {
        title,
        description: description.trim() || undefined,
        scheduledAt: `${scheduledAt}:00.000${BANGLADESH_TIMEZONE_OFFSET}`,
      },
      {
        onSuccess: () => {
          setTitle('');
          setDescription('');
          setScheduledAt('');
        },
      },
    );
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
              Create events, review schedules, and switch between table and calendar views.
            </p>
          </div>

          <div
            className="inline-flex gap-3 w-fit rounded-lg border border-sand/50 bg-cream p-1"
            aria-label="Events view"
          >
            {(['table', 'calendar'] as const).map((viewOption) => (
              <button
                key={viewOption}
                type="button"
                className={`rounded-md px-4 py-3 text-base font-medium capitalize text-zapier-black transition ${
                  view === viewOption
                    ? 'shadow-tab-active'
                    : 'hover:bg-light-sand hover:shadow-tab-hover'
                }`}
                aria-pressed={view === viewOption}
                onClick={() => setView(viewOption)}
              >
                {viewOption === 'table' ? 'Table' : 'Calendar'}
              </button>
            ))}
          </div>
        </header>

        <section className="rounded-content border border-sand/50 bg-cream p-6">
          <h2 className="text-card-title font-semibold text-zapier-black">Create Event</h2>
          <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-2 text-sm font-semibold text-dark-charcoal">
              Title
              <input
                type="text"
                className="rounded-content border border-sand/50 bg-cream px-3 py-2 text-zapier-black outline-none transition placeholder:text-warm-gray focus:border-zapier-orange"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-semibold text-dark-charcoal">
              Scheduled At
              <input
                type="datetime-local"
                className="rounded-content border border-sand/50 bg-cream px-3 py-2 font-system-ui text-zapier-black outline-none transition focus:border-zapier-orange"
                value={scheduledAt}
                onChange={(event) => setScheduledAt(event.target.value)}
                required
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-semibold text-dark-charcoal md:col-span-2">
              Description
              <textarea
                className="min-h-24 rounded-content border border-sand/50 bg-cream px-3 py-2 text-zapier-black outline-none transition placeholder:text-warm-gray focus:border-zapier-orange"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </label>

            <div className="flex flex-col gap-3 md:col-span-2 sm:flex-row sm:items-center">
              <button
                type="submit"
                className="w-fit rounded bg-zapier-orange px-4 py-2 text-base font-semibold text-cream transition hover:bg-zapier-black disabled:cursor-not-allowed disabled:opacity-50"
                disabled={createEvent.isPending}
              >
                {createEvent.isPending ? 'Creating...' : 'Create Event'}
              </button>

              {createEvent.isError && (
                <p className="rounded-content border border-zapier-orange bg-off-white px-3 py-2 text-sm font-medium text-dark-charcoal">
                  {createEvent.error.message}
                </p>
              )}
            </div>
          </form>
        </section>

        <section className="rounded-content border border-sand/50 bg-cream">
          <div className="border-b border-sand/50 px-6 py-5">
            <h2 className="text-card-title font-semibold text-zapier-black">All Events</h2>
          </div>

          <div className="p-6">
            {isLoading && <p className="text-sm font-medium text-warm-gray">Loading events...</p>}

            {isError && (
              <p className="rounded-content border border-zapier-orange bg-off-white px-3 py-2 text-sm font-medium text-dark-charcoal">
                {error.message}
              </p>
            )}

            {!isLoading && !isError && events.length === 0 && (
              <p className="text-sm font-medium text-warm-gray">No events yet.</p>
            )}

            {!isLoading &&
              !isError &&
              events.length > 0 &&
              (view === 'table' ? (
                <EventsTable events={events} />
              ) : (
                <EventsCalendar events={events} />
              ))}
          </div>
        </section>
      </div>
    </main>
  );
}
