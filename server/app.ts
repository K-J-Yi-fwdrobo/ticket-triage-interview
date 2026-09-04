import express, {
  type NextFunction,
  type Request,
  type RequestHandler,
  type Response,
} from 'express';

import {
  TICKET_STATUSES,
  type ApiErrorBody,
  type CreateTicketNoteRequest,
  type TicketStatus,
} from '../shared/tickets';
import { createTicketStore, type TicketStore } from './ticketStore';

const DEFAULT_DETAIL_DELAY_MS = 200;
const CREATE_NOTE_DELAY_MS = 1_200;
const NOTE_VALIDATION_MESSAGE =
  'Note body must contain between 1 and 280 characters.';

const DETAIL_DELAY_MS: Partial<Record<string, number>> = {
  'TCK-101': 800,
  'TCK-102': 100,
};

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function sendError(
  response: Response<ApiErrorBody>,
  status: number,
  code: string,
  message: string,
): void {
  response.status(status).json({ error: { code, message } });
}

function isTicketStatus(value: unknown): value is TicketStatus {
  return (
    typeof value === 'string' &&
    TICKET_STATUSES.some((status) => status === value)
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Will be used during task four
function createTicketNoteHandler(
  store: TicketStore,
): RequestHandler<{ ticketId: string }> {
  return async (request, response) => {
    await wait(CREATE_NOTE_DELAY_MS);

    const rawBody: unknown = (request.body as Partial<CreateTicketNoteRequest>)
      ?.body;
    if (typeof rawBody !== 'string') {
      sendError(response, 400, 'INVALID_NOTE', NOTE_VALIDATION_MESSAGE);
      return;
    }

    const body = rawBody.trim();
    if (body.length === 0 || body.length > 280) {
      sendError(response, 400, 'INVALID_NOTE', NOTE_VALIDATION_MESSAGE);
      return;
    }

    const note = store.addNote(request.params.ticketId, body);
    if (!note) {
      sendError(
        response,
        404,
        'TICKET_NOT_FOUND',
        `Ticket ${request.params.ticketId} was not found.`,
      );
      return;
    }

    response.status(201).json(note);
  };
}

export function createApp(store: TicketStore = createTicketStore()) {
  const app = express();
  app.use(express.json());

  app.get('/api/health', (_request, response) => {
    response.json({ status: 'ok' });
  });

  app.get('/api/tickets', (_request, response) => {
    response.json(store.list());
  });

  app.get('/api/tickets/:ticketId', async (request, response) => {
    const { ticketId } = request.params;
    await wait(DETAIL_DELAY_MS[ticketId] ?? DEFAULT_DETAIL_DELAY_MS);

    const ticket = store.findById(ticketId);
    if (!ticket) {
      sendError(
        response,
        404,
        'TICKET_NOT_FOUND',
        `Ticket ${ticketId} was not found.`,
      );
      return;
    }

    response.json(ticket);
  });

  app.patch('/api/tickets/:ticketId/status', (request, response) => {
    const { ticketId } = request.params;
    const status: unknown = request.body?.status;

    if (!isTicketStatus(status)) {
      sendError(
        response,
        400,
        'INVALID_STATUS',
        'Status must be open, in_progress, or resolved.',
      );
      return;
    }

    const ticket = store.updateStatus(ticketId, status);
    if (!ticket) {
      sendError(
        response,
        404,
        'TICKET_NOT_FOUND',
        `Ticket ${ticketId} was not found.`,
      );
      return;
    }

    response.json(ticket);
  });

  app.use((request, response: Response<ApiErrorBody>) => {
    sendError(
      response,
      404,
      'ROUTE_NOT_FOUND',
      `No route matches ${request.method} ${request.path}.`,
    );
  });

  app.use(
    (
      error: unknown,
      _request: Request,
      response: Response<ApiErrorBody>,
      next: NextFunction,
    ) => {
      if (response.headersSent) {
        next(error);
        return;
      }
      console.error(error);
      sendError(response, 500, 'INTERNAL_ERROR', 'An unexpected error occurred.');
    },
  );

  return app;
}
