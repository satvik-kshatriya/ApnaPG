import { z } from 'zod';

export const PropertyCreateSchema = z.object({
  title: z.string().min(1, 'Title must be at least 1 characters long').max(255),
  description: z.string().optional().default(''),
  locality: z.string().min(1, 'Locality is required'),
  latitude: z.number().min(-90, 'Invalid latitude').max(90),
  longitude: z.number().min(-180, 'Invalid longitude').max(180),
  monthly_rent: z.number().positive('Monthly rent must be positive'),
  occupancy_type: z.enum(['single', 'double', 'triple']),
  house_rules: z.record(z.string(), z.any()).optional(),
  images: z.array(z.object({
    url: z.string().url('Invalid image URL'),
    is_cover: z.boolean().default(false)
  })).optional().default([])
});

export const PropertyUpdateSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  locality: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  monthly_rent: z.number().positive().optional(),
  occupancy_type: z.enum(['single', 'double', 'triple']).optional(),
  house_rules: z.record(z.string(), z.any()).optional(),
  images: z.array(z.object({
    url: z.string().url('Invalid image URL'),
    is_cover: z.boolean().default(false)
  })).optional()
});
