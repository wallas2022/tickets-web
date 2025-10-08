export interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "AGENT" | "CUSTOMER";
}

export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface Ticket {
  id: string;
  code: string;
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  author: User;
  assignee?: User;
  createdAt: string;
  updatedAt: string;
}
