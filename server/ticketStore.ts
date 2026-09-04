import type { Ticket, TicketNote, TicketStatus } from '../shared/tickets';

const SEED_TICKETS: Ticket[] = [
  {
    id: 'TCK-101',
    title: 'Login form traps keyboard focus',
    description: 'Keyboard focus cannot leave the password visibility control.',
    requester: 'Jordan Lee',
    assignee: 'Maya Chen',
    status: 'open',
    priority: 'high',
    updatedAt: '2030-04-18T13:10:00.000Z',
    notes: [
      {
        id: 'NOTE-1001',
        body: 'Reproduced with keyboard navigation in the latest browser build.',
        author: 'Maya Chen',
        createdAt: '2030-04-18T13:10:00.000Z',
      },
    ],
  },
  {
    id: 'TCK-102',
    title: 'CSV export misses the final row',
    description: 'Exports with more than fifty rows omit the last visible record.',
    requester: 'Sam Rivera',
    assignee: 'Owen Brooks',
    status: 'in_progress',
    priority: 'medium',
    updatedAt: '2030-04-18T13:20:00.000Z',
    notes: [],
  },
  {
    id: 'TCK-103',
    title: 'Dark theme has low contrast labels',
    description: 'Secondary labels are difficult to read on the settings page.',
    requester: 'Alex Morgan',
    assignee: 'Priya Shah',
    status: 'resolved',
    priority: 'high',
    updatedAt: '2030-04-18T13:30:00.000Z',
    notes: [],
  },
  {
    id: 'TCK-104',
    title: 'Billing address helper contains a typo',
    description: 'The postal code helper text contains a spelling error.',
    requester: 'Taylor Kim',
    assignee: null,
    status: 'resolved',
    priority: 'low',
    updatedAt: '2030-04-18T13:40:00.000Z',
    notes: [],
  },
];

function cloneTicket(ticket: Ticket): Ticket {
  return {
    ...ticket,
    notes: ticket.notes.map((note) => ({ ...note })),
  };
}

export class TicketStore {
  private nextNoteNumber = 2001;
  private tickets: Ticket[];

  constructor(initialTickets: Ticket[] = SEED_TICKETS) {
    this.tickets = initialTickets.map(cloneTicket);
  }

  list(): Ticket[] {
    return this.tickets.map(cloneTicket);
  }

  findById(ticketId: string): Ticket | undefined {
    const ticket = this.tickets.find((candidate) => candidate.id === ticketId);
    return ticket ? cloneTicket(ticket) : undefined;
  }

  updateStatus(ticketId: string, status: TicketStatus): Ticket | undefined {
    const ticket = this.tickets.find((candidate) => candidate.id === ticketId);
    if (!ticket) {
      return undefined;
    }

    ticket.status = status;
    ticket.updatedAt = new Date().toISOString();
    return cloneTicket(ticket);
  }

  addNote(ticketId: string, body: string): TicketNote | undefined {
    const ticket = this.tickets.find((candidate) => candidate.id === ticketId);
    if (!ticket) {
      return undefined;
    }

    const note: TicketNote = {
      id: `NOTE-${this.nextNoteNumber++}`,
      body,
      author: 'Interview candidate',
      createdAt: new Date().toISOString(),
    };
    ticket.notes.push(note);
    ticket.updatedAt = note.createdAt;
    return { ...note };
  }
}

export function createTicketStore(): TicketStore {
  return new TicketStore();
}
