import {
  TICKET_STATUSES,
  type Ticket,
  type TicketStatus,
} from '../shared/tickets';

const STATUS_LABELS: Record<TicketStatus, string> = {
  open: 'Open',
  in_progress: 'In progress',
  resolved: 'Resolved',
};

interface TicketListProps {
  tickets: Ticket[];
  selectedTicketId: string | null;
  updatingTicketId: string | null;
  onSelect: (ticketId: string) => void;
  onStatusChange: (visibleIndex: number, status: TicketStatus) => void;
}

export function TicketList({
  tickets,
  selectedTicketId,
  updatingTicketId,
  onSelect,
  onStatusChange,
}: TicketListProps) {
  if (tickets.length === 0) {
    return <p className="empty-state">No tickets have this priority.</p>;
  }

  return (
    <ul className="ticket-list" aria-label="Support tickets">
      {tickets.map((ticket, visibleIndex) => (
        <li key={ticket.id}>
          <article
            className={
              selectedTicketId === ticket.id
                ? 'ticket-card ticket-card--selected'
                : 'ticket-card'
            }
          >
            <div className="ticket-card__topline">
              <span className={`priority priority--${ticket.priority}`}>
                {ticket.priority}
              </span>
              <span className="ticket-id">{ticket.id}</span>
            </div>

            <h3>{ticket.title}</h3>
            <p className="ticket-card__meta">
              Assigned to {ticket.assignee ?? 'Unassigned'}
            </p>

            <div className="ticket-card__actions">
              <button
                type="button"
                aria-label={`View details for ${ticket.id}`}
                onClick={() => onSelect(ticket.id)}
              >
                View details
              </button>

              <label>
                <span className="sr-only">Status for {ticket.id}</span>
                <select
                  aria-label={`Status for ${ticket.id}`}
                  value={ticket.status}
                  disabled={updatingTicketId === ticket.id}
                  onChange={(event) =>
                    onStatusChange(
                      visibleIndex,
                      event.target.value as TicketStatus,
                    )
                  }
                >
                  {TICKET_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
}
