import type { Event } from "../types/event.types";

const DEFAULT_LOCATION_LIMIT = 30;
const BANGLADESH_TIMEZONE_OFFSET = "+06:00";

export function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatTicketPrice(event: Event) {
  if (event.isFree) {
    return "Free";
  }

  const ticketPrice = Number(event.ticketPrice);

  if (Number.isNaN(ticketPrice)) {
    return event.ticketPrice ?? "-";
  }

  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(ticketPrice);
}

export function truncateLocation(
  locationValue: string,
  limit = DEFAULT_LOCATION_LIMIT,
) {
  if (locationValue.length <= limit) {
    return locationValue;
  }

  return `${locationValue.slice(0, limit - 3)}...`;
}

export function toBangladeshIsoDateTime(value: string) {
  return value ? `${value}:00.000${BANGLADESH_TIMEZONE_OFFSET}` : undefined;
}
