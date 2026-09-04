import { useCallback, useEffect, useMemo, useState } from 'react';

import type {
  Ticket,
  TicketPriority,
  TicketStatus,
} from '../shared/tickets';
import { getTicket, listTickets, updateTicketStatus } from './api';
import { TicketDetail, type DetailState } from './TicketDetail';
import { TicketList } from './TicketList';

type PriorityFilter = 'all' | TicketPriority;

type TicketLoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; tickets: Ticket[] };

const EMPTY_TICKETS: Ticket[] = [];

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'An unexpected error occurred.';
}

export default function App() {
  const [ticketState, setTicketState] = useState<TicketLoadState>({
    status: 'loading',
  });
  const [priorityFilter, setPriorityFilter] =
    useState<PriorityFilter>('all');
  const [detailState, setDetailState] = useState<DetailState>({
    status: 'idle',
    selectedId: null,
  });
  const [updatingTicketId, setUpdatingTicketId] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  const loadTickets = useCallback(() => {
    void listTickets().then(
      (tickets) => setTicketState({ status: 'ready', tickets }),
      (error: unknown) =>
        setTicketState({ status: 'error', message: errorMessage(error) }),
    );
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const tickets =
    ticketState.status === 'ready' ? ticketState.tickets : EMPTY_TICKETS;
  const visibleTickets = useMemo(
    () =>
      priorityFilter === 'all'
        ? tickets
        : tickets.filter((ticket) => ticket.priority === priorityFilter),
    [priorityFilter, tickets],
  );

  async function handleStatusChange(
    visibleIndex: number,
    nextStatus: TicketStatus,
  ) {
    const ticketToUpdate = tickets[visibleIndex];
    if (!ticketToUpdate) {
      return;
    }

    setUpdatingTicketId(ticketToUpdate.id);
    setStatusError(null);
    try {
      const updatedTicket = await updateTicketStatus(
        ticketToUpdate.id,
        nextStatus,
      );
      setTicketState((current) =>
        current.status === 'ready'
          ? {
              status: 'ready',
              tickets: current.tickets.map((ticket) =>
                ticket.id === updatedTicket.id ? updatedTicket : ticket,
              ),
            }
          : current,
      );
      setDetailState((current) =>
        current.status === 'ready' && current.ticket.id === updatedTicket.id
          ? { ...current, ticket: updatedTicket }
          : current,
      );
    } catch (error) {
      setStatusError(errorMessage(error));
    } finally {
      setUpdatingTicketId(null);
    }
  }

  async function handleSelectTicket(ticketId: string) {
    setDetailState({ status: 'loading', selectedId: ticketId });
    try {
      const ticket = await getTicket(ticketId);
      setDetailState((current) => {
        if (current.selectedId === null) {
          return current;
        }
        return { status: 'ready', selectedId: current.selectedId, ticket };
      });
    } catch (error: unknown) {
      setDetailState((current) => {
        if (current.selectedId === null) {
          return current;
        }
        return {
          status: 'error',
          selectedId: current.selectedId,
          message: errorMessage(error),
        };
      });
    }
  }

  return (
    <>
      <header className="app-header">
        <div>
          <p className="app-header__eyebrow">Support workspace</p>
          <h1>Ticket triage</h1>
        </div>
        <span className="environment-badge">Training environment</span>
      </header>

      <main className="workspace">
        <section className="queue-panel" aria-labelledby="queue-title">
          <div className="queue-panel__heading">
            <div>
              <p className="section-eyebrow">Current queue</p>
              <h2 id="queue-title">Tickets</h2>
            </div>

            <label className="filter-field">
              Priority
              <select
                value={priorityFilter}
                onChange={(event) =>
                  setPriorityFilter(event.target.value as PriorityFilter)
                }
              >
                <option value="all">All priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </label>
          </div>

          {statusError ? <p role="alert">{statusError}</p> : null}

          {ticketState.status === 'loading' ? (
            <p role="status">Loading tickets…</p>
          ) : null}

          {ticketState.status === 'error' ? (
            <div className="load-error" role="alert">
              <p>{ticketState.message}</p>
              <button
                type="button"
                onClick={() => {
                  setTicketState({ status: 'loading' });
                  loadTickets();
                }}
              >
                Try again
              </button>
            </div>
          ) : null}

          {ticketState.status === 'ready' ? (
            <>
              <p className="ticket-count" aria-live="polite">
                Showing X of Y tickets
              </p>
              <TicketList
                tickets={visibleTickets}
                selectedTicketId={detailState.selectedId}
                updatingTicketId={updatingTicketId}
                onSelect={handleSelectTicket}
                onStatusChange={(visibleIndex, status) =>
                  void handleStatusChange(visibleIndex, status)
                }
              />
            </>
          ) : null}
        </section>

        <TicketDetail state={detailState} />
      </main>
    </>
  );
}
