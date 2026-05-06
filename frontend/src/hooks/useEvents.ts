import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { eventsApi, type EventFilters } from '../api/events.api';

/**
 * Fetches all events, optionally filtered by status or date range.
 *
 * Refetches when the filter object changes, the query is invalidated, the
 * window refocuses, or React Query otherwise considers the data stale. The
 * filters are included in the query key so each unique filter combination gets
 * its own cache entry and changing filters automatically fetches the matching
 * data instead of reusing a different event list.
 *
 * Cache keys invalidated on success: none.
 */
export function useEvents(filters?: EventFilters) {
  return useQuery({
    queryKey: ['events', filters],
    queryFn: () => eventsApi.getAll(filters),
  });
}

/**
 * Fetches a single event by id.
 *
 * Refetches when the id changes, the query is invalidated, the window refocuses,
 * or React Query otherwise considers the data stale. The query only runs when a
 * truthy id is provided.
 *
 * Cache keys invalidated on success: none.
 */
export function useEvent(id: number) {
  return useQuery({
    queryKey: ['events', id],
    queryFn: () => eventsApi.getById(id),
    enabled: !!id,
  });
}

/**
 * Creates a new event.
 *
 * Refetches affected event queries after a successful mutation by invalidating
 * the events cache. The returned mutation result exposes error state through
 * `error`, `isError`, and related React Query fields for component messages.
 *
 * Cache keys invalidated on success: ['events'].
 */
export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: eventsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

/**
 * Cancels an event's schedule by id.
 *
 * Refetches affected event queries after a successful mutation by invalidating
 * the events list cache and the specific event cache. The returned mutation
 * result exposes error state through `error`, `isError`, and related React Query
 * fields for component messages.
 *
 * Cache keys invalidated on success: ['events'] and ['events', id].
 */
export function useCancelSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => eventsApi.cancelSchedule(id),
    onSuccess: (_event, id) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', id] });
    },
  });
}

/**
 * Cancels an event by id.
 *
 * Refetches affected event queries after a successful mutation by invalidating
 * the events list cache and the specific event cache. The returned mutation
 * result exposes error state through `error`, `isError`, and related React Query
 * fields for component messages.
 *
 * Cache keys invalidated on success: ['events'] and ['events', id].
 */
export function useCancelEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => eventsApi.cancelEvent(id),
    onSuccess: (_event, id) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', id] });
    },
  });
}
