import { z } from 'zod';

export const ConnectionCreateSchema = z.object({
  property_id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid property_id (Mongoose ObjectId required)')
});

export const ConnectionStatusUpdateSchema = z.object({
  status: z.enum(['accepted', 'rejected', 'active_tenancy', 'ended'])
});
