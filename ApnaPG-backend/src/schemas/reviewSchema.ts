import { z } from 'zod';

export const ReviewCreateSchema = z.object({
  connection_id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid connection_id'),
  target_user_id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid target_user_id'),
  rating: z.number().int().min(1).max(5),
  review_text: z.string().min(1, 'Review text is required')
});
