import { Request, Response } from 'express';
import { clerkClient } from '@clerk/clerk-sdk-node';
import User from '../models/User.js';
import { UserSyncSchema, UserUpdateSchema } from '../schemas/userSchema.js';

export const syncUser = async (req: Request, res: Response) => {
  try {
    const validatedData = UserSyncSchema.parse(req.body);
    
    // 🛡️ SECURITY: Trust the role from Clerk JWT (via authMiddleware) 
    // over the role provided by the frontend.
    const jwtRole = req.user?.role;
    const finalRole = (jwtRole && jwtRole !== 'tenant') ? jwtRole : validatedData.role;

    const user = await User.findOneAndUpdate(
      { clerk_id: validatedData.clerk_id },
      { 
        $set: {
          ...validatedData,
          role: finalRole as any
        }
      },
      { upsert: true, new: true }
    );

    // 🚀 ASYNC PROMOTION: Promotes the role to Clerk publicMetadata 
    // This ensures subsequent JWTs issued by Clerk contain the correct role.
    try {
      await clerkClient.users.updateUserMetadata(validatedData.clerk_id, {
        publicMetadata: { role: finalRole }
      });
      console.log(`✅ [PROMOTION] Role [${finalRole}] promoted to Clerk for user [${validatedData.clerk_id}]`);
    } catch (clerkErr: any) {
      console.error(`❌ [PROMOTION] Failed to update Clerk metadata:`, clerkErr.message);
    }

    return res.status(201).json(user);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation Error', details: err.errors });
    }
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    if (!req.user?._id) {
      return res.status(404).json({ error: 'Not Found', message: 'User profile not found. Please sync first.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'Not Found', message: 'User not found' });
    }

    return res.json(user);
  } catch (err: any) {
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
};

export const updateMe = async (req: Request, res: Response) => {
  try {
    if (!req.user?._id) {
      return res.status(404).json({ error: 'Not Found' });
    }

    const validatedData = UserUpdateSchema.parse(req.body);
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: validatedData },
      { new: true }
    );

    return res.json(user);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation Error', details: err.errors });
    }
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
};
