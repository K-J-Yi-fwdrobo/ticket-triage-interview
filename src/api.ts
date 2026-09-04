import type { ApiErrorBody, Ticket, TicketStatus } from '../shared/tickets';

export class ApiRequestError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.code = code;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = (await response.json()) as ApiErrorBody;
    throw new ApiRequestError(
      response.status,
      body.error?.code ?? 'UNKNOWN_ERROR',
      body.error?.message ?? 'The request failed.',
    );
  }

  return (await response.json()) as T;
}

export function listTickets(): Promise<Ticket[]> {
  return request<Ticket[]>('/api/tickets');
}

export function getTicket(ticketId: string): Promise<Ticket> {
  return request<Ticket>(`/api/tickets/${ticketId}`);
}

export function updateTicketStatus(
  ticketId: string,
  status: TicketStatus,
): Promise<Ticket> {
  return request<Ticket>(`/api/tickets/${ticketId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });
}
