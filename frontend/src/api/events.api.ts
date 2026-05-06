import client from './client';
import type { CreateEventDto, Event } from '../types/event.types';

export type EventFilters = {
  status?: string;
  from?: string;
  to?: string;
};

export const eventsApi = {
  async getAll(filters?: EventFilters): Promise<Event[]> {
    const response = await client.get<Event[]>('/events', {
      params: filters,
    });

    return response.data;
  },

  async getById(id: number): Promise<Event> {
    const response = await client.get<Event>(`/events/${id}`);

    return response.data;
  },

  async create(dto: CreateEventDto): Promise<Event> {
    const response = await client.post<Event>('/events', dto);

    return response.data;
  },

  async cancelSchedule(id: number): Promise<Event> {
    const response = await client.patch<Event>(`/events/${id}/cancel-schedule`);

    return response.data;
  },

  async cancelEvent(id: number): Promise<Event> {
    const response = await client.patch<Event>(`/events/${id}/cancel`);

    return response.data;
  },
};
