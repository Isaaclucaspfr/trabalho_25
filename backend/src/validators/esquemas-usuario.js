import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(3).optional(),
  email: z.string().email().optional()
});
