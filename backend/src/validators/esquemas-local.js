import { z } from 'zod';

export const locationSchema = z.object({
  name: z.string().min(2),
  address: z.string().min(3),
  city: z.string().min(2),
  state: z.string().min(2),
  zipCode: z.string().min(5),
  maxCapacity: z.number().int().positive(),
  description: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional()
});
