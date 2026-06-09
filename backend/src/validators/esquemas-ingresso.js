import { z } from 'zod';

export const reserveTicketSchema = z.object({
  eventId: z.string(),
  quantity: z.number().int().positive()
});

export const ticketActionSchema = z.object({ ticketId: z.string() });
