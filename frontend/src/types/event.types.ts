export type EventStatus =
  | "PENDING"
  | "ACTIVE"
  | "CANCELLED_SCHEDULE"
  | "CANCELLED"
  | "COMPLETED";

export type EventLocationType = "PHYSICAL" | "ONLINE";
export type EventsView = "table" | "calendar";
export type HomeContentView = "list" | "form";
export type EventStatusFilter = EventStatus | "";

export interface Event {
  id: number;
  title: string;
  description: string | null;
  scheduledAt: string;
  endedAt: string;
  isFree: boolean;
  ticketPrice: string | null;
  capacity: number | null;
  requiresApproval: boolean;
  isPublic: boolean;
  locationType: "PHYSICAL" | "ONLINE";
  locationValue: string;
  coverImageUrl: string | null;
  status: EventStatus;
  bullJobId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventDto {
  title: string;
  description?: string;
  scheduledAt: string;
  endedAt: string;
  isFree: boolean;
  ticketPrice?: number;
  capacity?: number;
  requiresApproval: boolean;
  isPublic: boolean;
  locationType: "PHYSICAL" | "ONLINE";
  locationValue: string;
  coverImageUrl?: string;
}
