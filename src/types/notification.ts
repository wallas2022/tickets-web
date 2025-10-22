export interface AppNotification {
  id: string;
  type:
    | "ticket_created"
    | "ticket_status_changed"
    | "ticket_assigned"
    | "ticket_commented"
    | string;
  payload: Record<string, any>;
  readAt: string | null;
  createdAt: string;
}
