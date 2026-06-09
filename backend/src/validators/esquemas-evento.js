import { z } from 'zod';

export const eventSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  eventDate: z.string(),
  time: z.string(),
  category: z.string(),
  capacity: z.number().int().positive(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'SOLD_OUT', 'CANCELED']).optional(),
  price: z.number().nonnegative(),
  highlighted: z.boolean().optional(),
  locationId: z.string(),
  artistIds: z.array(z.string()).optional()
});
