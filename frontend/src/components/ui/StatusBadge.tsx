import type { EventStatus } from '../../types/event.types';

type StatusBadgeProps = {
  status: EventStatus;
};

const statusStyles: Record<EventStatus, string> = {
  PENDING: 'border-zapier-orange bg-off-white text-zapier-orange',
  ACTIVE: 'border-zapier-black bg-zapier-black text-cream',
  CANCELLED_SCHEDULE: 'border-sand bg-light-sand text-dark-charcoal',
  CANCELLED: 'border-mid-warm bg-cream text-warm-gray',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-pill border px-3 py-1 text-micro font-semibold uppercase tracking-label ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}
