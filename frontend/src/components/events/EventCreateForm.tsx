import { type FormEvent, useState } from "react";
import { useCreateEvent } from "../../hooks/useEvents";
import { toBangladeshIsoDateTime } from "../../utils/eventFormatters";
import type { EventLocationType } from "../../types/event.types";

const composerFieldClass =
  "w-full rounded-content border border-sand bg-cream px-3 py-2 text-sm font-semibold text-zapier-black outline-none transition placeholder:text-warm-gray focus:border-zapier-orange disabled:bg-light-sand disabled:text-warm-gray";
const composerInlineInputClass =
  "w-full rounded-content border border-sand bg-cream px-3 py-2 text-right text-sm font-semibold text-zapier-black outline-none transition placeholder:text-warm-gray focus:border-zapier-orange sm:max-w-56";
const composerRowClass =
  "flex flex-col gap-3 border-b border-sand/50 px-4 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between";
const composerLabelClass = "text-sm font-semibold text-dark-charcoal";
const composerErrorClass = "mt-2 text-sm font-semibold text-zapier-orange";

export function EventCreateForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [endedAt, setEndedAt] = useState("");
  const [endedAtError, setEndedAtError] = useState("");
  const [isFree, setIsFree] = useState(true);
  const [ticketPrice, setTicketPrice] = useState("");
  const [ticketPriceError, setTicketPriceError] = useState("");
  const [capacity, setCapacity] = useState("");
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [locationType, setLocationType] = useState<EventLocationType | "">("");
  const [locationValue, setLocationValue] = useState("");
  const [locationValueWarning, setLocationValueWarning] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");

  const createEvent = useCreateEvent();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (endedAt <= scheduledAt) {
      setEndedAtError("End time must be after the start time");
      return;
    }

    setEndedAtError("");
    setTicketPriceError("");
    setLocationValueWarning("");

    if (!isFree && (!ticketPrice || Number(ticketPrice) <= 0)) {
      setTicketPriceError("Ticket price is required for paid events");
      return;
    }

    if (!locationType) {
      setLocationValueWarning("Select a location type");
      return;
    }

    if (locationType && !locationValue.trim()) {
      setLocationValueWarning(
        locationType === "PHYSICAL"
          ? "Address is required"
          : "Meeting URL is required",
      );
      return;
    }

    createEvent.mutate(
      {
        title,
        description: description.trim() || undefined,
        scheduledAt: toBangladeshIsoDateTime(scheduledAt) ?? "",
        endedAt: toBangladeshIsoDateTime(endedAt) ?? "",
        isFree,
        ticketPrice: isFree ? undefined : Number(ticketPrice),
        capacity: capacity ? Number(capacity) : undefined,
        requiresApproval,
        isPublic,
        locationType,
        locationValue: locationValue.trim(),
        coverImageUrl: coverImageUrl.trim() || undefined,
      },
      {
        onSuccess: () => {
          setTitle("");
          setDescription("");
          setScheduledAt("");
          setEndedAt("");
          setEndedAtError("");
          setIsFree(true);
          setTicketPrice("");
          setTicketPriceError("");
          setCapacity("");
          setRequiresApproval(false);
          setIsPublic(true);
          setLocationType("");
          setLocationValue("");
          setLocationValueWarning("");
          setCoverImageUrl("");
        },
      },
    );
  };

  return (
    <section className="overflow-hidden rounded-content border border-sand bg-cream text-zapier-black">
      <form className="p-4 sm:p-6" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <label className="min-w-0 flex-1">
            <span className="sr-only">Title</span>
            <input
              type="text"
              placeholder="Event Name"
              className="w-full border-0 bg-transparent font-display text-display-sm font-medium leading-none text-zapier-black outline-none placeholder:text-warm-gray sm:text-display"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </label>

          <fieldset className="shrink-0">
            <legend className="sr-only">Accessibility</legend>
            <div className="inline-flex rounded-lg border border-sand/50 bg-light-sand p-1">
              <label className="cursor-pointer">
                <input
                  type="radio"
                  name="accessibility"
                  className="peer sr-only"
                  checked={isPublic}
                  onChange={() => setIsPublic(true)}
                />
                <span className="block rounded-md px-3 py-2 text-sm font-semibold text-dark-charcoal transition peer-checked:bg-cream peer-checked:text-zapier-black peer-checked:shadow-tab-active">
                  Public
                </span>
              </label>
              <label className="cursor-pointer">
                <input
                  type="radio"
                  name="accessibility"
                  className="peer sr-only"
                  checked={!isPublic}
                  onChange={() => setIsPublic(false)}
                />
                <span className="block rounded-md px-3 py-2 text-sm font-semibold text-dark-charcoal transition peer-checked:bg-cream peer-checked:text-zapier-black peer-checked:shadow-tab-active">
                  Private
                </span>
              </label>
            </div>
          </fieldset>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_14rem]">
          <div className="rounded-lg border border-sand bg-off-white">
            <div className={composerRowClass}>
              <span className={composerLabelClass}>Start</span>
              <input
                type="datetime-local"
                className={composerInlineInputClass}
                value={scheduledAt}
                onChange={(event) => setScheduledAt(event.target.value)}
                required
              />
            </div>

            <div className={composerRowClass}>
              <span className={composerLabelClass}>End</span>
              <div className="w-full sm:max-w-56">
                <input
                  type="datetime-local"
                  className={composerInlineInputClass}
                  value={endedAt}
                  onChange={(event) => {
                    setEndedAt(event.target.value);
                    setEndedAtError("");
                  }}
                  required
                />
                {endedAtError && (
                  <span className={composerErrorClass}>{endedAtError}</span>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-sand bg-off-white p-4">
            <span className={composerLabelClass}>Timezone</span>
            <p className="mt-2 text-base font-semibold text-zapier-black">
              GMT+06:00
            </p>
            <p className="mt-1 text-sm font-semibold text-warm-gray">Dhaka</p>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-sand bg-off-white p-4">
          <div className="grid gap-3 lg:grid-cols-[14rem_1fr]">
            <label className="flex flex-col gap-2">
              <span className={composerLabelClass}>Location Type</span>
              <select
                className={composerFieldClass}
                value={locationType}
                onChange={(event) => {
                  setLocationType(event.target.value as EventLocationType | "");
                  setLocationValue("");
                  setLocationValueWarning("");
                }}
              >
                <option value="">Select location type</option>
                <option value="PHYSICAL">Physical</option>
                <option value="ONLINE">Online</option>
              </select>
              {!locationType && locationValueWarning && (
                <span className={composerErrorClass}>
                  {locationValueWarning}
                </span>
              )}
            </label>

            <label className="flex flex-col gap-2">
              <span className={composerLabelClass}>
                {locationType === "ONLINE" ? "Meeting URL" : "Address"}
              </span>
              <input
                type="text"
                placeholder={
                  locationType === "ONLINE"
                    ? "Add virtual link"
                    : "Add event location"
                }
                className={composerFieldClass}
                value={locationValue}
                onChange={(event) => {
                  setLocationValue(event.target.value);
                  setLocationValueWarning("");
                }}
                disabled={!locationType}
              />
              {locationType && locationValueWarning && (
                <span className={composerErrorClass}>
                  {locationValueWarning}
                </span>
              )}
            </label>
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <label className="flex flex-col gap-2 rounded-lg border border-sand bg-off-white p-4">
            <span className={composerLabelClass}>Description</span>
            <textarea
              placeholder="Add Description"
              className={`${composerFieldClass} min-h-24 resize-y`}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </label>

          <label className="flex flex-col gap-2 rounded-lg border border-sand bg-off-white p-4">
            <span className={composerLabelClass}>
              Cover Image URL (optional)
            </span>
            <input
              type="text"
              placeholder="https://..."
              className={composerFieldClass}
              value={coverImageUrl}
              onChange={(event) => setCoverImageUrl(event.target.value)}
            />
          </label>
        </div>

        <div className="mt-5">
          <h2 className="text-sm font-semibold uppercase tracking-label text-dark-charcoal">
            Event Options
          </h2>
          <div className="mt-3 rounded-lg border border-sand bg-off-white">
            <div className={composerRowClass}>
              <label className="flex items-center gap-3 text-sm font-semibold text-dark-charcoal">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-zapier-orange"
                  checked={isFree}
                  onChange={(event) => {
                    setIsFree(event.target.checked);
                    setTicketPriceError("");
                    if (event.target.checked) {
                      setTicketPrice("");
                    }
                  }}
                />
                Free Event
              </label>
              {isFree ? (
                <span className="text-sm font-semibold text-warm-gray">
                  Free
                </span>
              ) : (
                <div className="w-full sm:max-w-56">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Ticket Price ($)"
                    className={composerInlineInputClass}
                    value={ticketPrice}
                    onChange={(event) => {
                      setTicketPrice(event.target.value);
                      setTicketPriceError("");
                    }}
                  />
                  {ticketPriceError && (
                    <span className={composerErrorClass}>
                      {ticketPriceError}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className={composerRowClass}>
              <label className="flex items-center gap-3 text-sm font-semibold text-dark-charcoal">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-zapier-orange"
                  checked={requiresApproval}
                  onChange={(event) =>
                    setRequiresApproval(event.target.checked)
                  }
                />
                Requires Approval
              </label>
              <span className="text-sm font-semibold text-warm-gray">
                {requiresApproval ? "Required" : "Not required"}
              </span>
            </div>

            <label className={composerRowClass}>
              <span className={composerLabelClass}>Capacity</span>
              <input
                type="number"
                min="1"
                placeholder="Unlimited"
                className={composerInlineInputClass}
                value={capacity}
                onChange={(event) => setCapacity(event.target.value)}
              />
            </label>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          {createEvent.isError && (
            <p className="rounded-content border border-zapier-orange bg-off-white px-3 py-2 text-sm font-semibold text-dark-charcoal">
              {createEvent.error.message}
            </p>
          )}
          <button
            type="submit"
            className="w-full rounded-lg border border-zapier-orange bg-zapier-orange px-5 py-4 text-base font-semibold text-cream transition hover:border-zapier-black hover:bg-zapier-black disabled:cursor-not-allowed disabled:opacity-50"
            disabled={createEvent.isPending}
          >
            {createEvent.isPending ? "Creating..." : "Create Event"}
          </button>
        </div>
      </form>
    </section>
  );
}
