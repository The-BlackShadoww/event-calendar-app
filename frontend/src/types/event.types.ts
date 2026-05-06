export type EventStatus =
  | 'PENDING'
  | 'ACTIVE'
  | 'CANCELLED_SCHEDULE'
  | 'CANCELLED'

export interface Event {
  id: number
  title: string
  description: string | null
  scheduledAt: string
  status: EventStatus
  bullJobId: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateEventDto {
  title: string
  description?: string
  scheduledAt: string
}
