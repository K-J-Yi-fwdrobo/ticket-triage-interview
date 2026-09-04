import type { Ticket } from '../shared/tickets';

export type DetailState =
  | { status: 'idle'; selectedId: null }
  | { status: 'loading'; selectedId: string }
  | { status: 'ready'; selectedId: string; ticket: Ticket }
  | { status: 'error'; selectedId: string; message: string };

interface TicketDetailProps {
  state: DetailState;
}

function readableStatus(status: Ticket['status']): string {
  return status === 'in_progress'
    ? 'In progress'
    : status[0].toUpperCase() + status.slice(1);
}

export function TicketDetail({ state }: TicketDetailProps) {
  if (state.status === 'idle') {
    return (
      <aside className="detail-panel detail-panel--placeholder">
        <p>Select a ticket to inspect its details.</p>
      </aside>
    );
  }

  if (state.status === 'loading') {
    return (
      <aside className="detail-panel" aria-live="polite">
        <p role="status">Loading {state.selectedId}…</p>
      </aside>
    );
  }

  if (state.status === 'error') {
    return (
      <aside className="detail-panel">
        <p role="alert">{state.message}</p>
      </aside>
    );
  }

  const { ticket } = state;
  return (
    <aside className="detail-panel" aria-labelledby="ticket-detail-title">
      <div className="detail-panel__eyebrow">{ticket.id}</div>
      <h2 id="ticket-detail-title">{ticket.title}</h2>
      <p>{ticket.description}</p>

      <dl className="detail-grid">
        <div>
          <dt>Status</dt>
          <dd>{readableStatus(ticket.status)}</dd>
        </div>
        <div>
          <dt>Priority</dt>
          <dd>{ticket.priority}</dd>
        </div>
        <div>
          <dt>Requester</dt>
          <dd>{ticket.requester}</dd>
        </div>
        <div>
          <dt>Assignee</dt>
          <dd>{ticket.assignee ?? 'Unassigned'}</dd>
        </div>
      </dl>

      <section className="notes" aria-labelledby="notes-title">
        <h3 id="notes-title">Internal notes</h3>
        {ticket.notes.length === 0 ? (
          <p className="muted">No internal notes yet.</p>
        ) : (
          <ul>
            {ticket.notes.map((note) => (
              <li key={note.id}>
                <p>{note.body}</p>
                <small>
                  {note.author} ·{' '}
                  <time dateTime={note.createdAt}>
                    {note.createdAt.slice(0, 10)}
                  </time>
                </small>
              </li>
            ))}
          </ul>
        )}

        <form className="note-form">
          <p>To be implemented</p>
          <button type="submit" disabled>
            Add note
          </button>
        </form>
      </section>
    </aside>
  );
}
