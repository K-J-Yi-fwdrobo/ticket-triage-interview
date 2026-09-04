export const TICKET_STATUSES = ['open', 'in_progress', 'resolved'] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const TICKET_PRIORITIES = ['high', 'medium', 'low'] as const;
export type TicketPriority = (typeof TICKET_PRIORITIES)[number];

export interface TicketNote {
  id: string;
  body: string;
  author: string;
  createdAt: string;
}

export interface CreateTicketNoteRequest {
  body: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  requester: string;
  assignee: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  updatedAt: string;
  notes: TicketNote[];
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
  };
}
