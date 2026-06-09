import { z } from 'zod';

export const artistSchema = z.object({
  name: z.string().min(2),
  biography: z.string().optional(),
  musicGenre: z.string().optional(),
  socialLinks: z.record(z.string()).optional()
});
