import { z } from 'zod';

export const UserSyncSchema = z.object({
  clerk_id: z.string().min(1, 'clerk_id is required'),
  role: z.enum(['tenant', 'owner', 'admin']).default('tenant'),
  full_name: z.string().min(1, 'full_name is required'),
  email: z.string().email('Invalid email address'),
  phone_number: z.string().optional(),
  profile_image_url: z.string().url('Invalid profile image URL').optional(),
  occupation: z.string().optional(),
  gender: z.string().optional(),
  bio: z.string().optional(),
  hometown: z.string().optional(),
  verified: z.boolean().optional()
});

export const UserUpdateSchema = z.object({
  full_name: z.string().optional(),
  phone_number: z.string().optional(),
  profile_image_url: z.string().url().optional(),
  occupation: z.string().optional(),
  gender: z.string().optional(),
  bio: z.string().optional(),
  hometown: z.string().optional(),
  verified: z.boolean().optional()
});
