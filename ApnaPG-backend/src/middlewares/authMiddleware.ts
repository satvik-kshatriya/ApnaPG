import { Request, Response, NextFunction } from 'express';
import { clerkClient } from '@clerk/clerk-sdk-node';
import User from '../models/User.js';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Authorization header is missing or malformed' 
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    // 1. Verify Clerk JWT
    const decodedToken = await clerkClient.verifyToken(token);
    
    // ---  DEBUG: Token Diagnostic ---
    // Log the structure to see where the 'role' claim is hidden
    console.log('🔑 [DEBUG] Clerk Token Sub:', decodedToken.sub);
    console.log('🔑 [DEBUG] Clerk Token Metadata:', JSON.stringify(decodedToken.publicMetadata || decodedToken.metadata || {}, null, 2));
    // Check if the user has renamed the claim in the dashboard
    console.log('🔑 [DEBUG] All Claims:', JSON.stringify(Object.keys(decodedToken)));
    // --- END DEBUG ---

    const clerk_id = decodedToken.sub;
    
    // 2. Extract role strictly from JWT metadata (Stateless RBAC)
    // We check all possible locations for the metadata/role claim.
    // Note: Clerk sometimes places metadata in 'publicMetadata' or just 'metadata'.
    const metadata = (decodedToken.metadata || decodedToken.publicMetadata || (decodedToken as any).public_metadata || {}) as any;
    const unsafeMetadata = (decodedToken as any).unsafe_metadata || {};
    
    let role = (metadata.role as string) || 
               (unsafeMetadata.role as string) || 
               (decodedToken as any).role || 
               'tenant';
    
    // 3. Link with our local MongoDB User only to fetch the internal _id
    let user = await User.findOne({ clerk_id });
    
    // [DEVELOPMENT FALLBACK] 
    // If JWT has no role metadata (defaults to tenant), check our local DB.
    if (role === 'tenant' && user && user.role !== 'tenant') {
      console.warn(`⚠️ [WARNING] Clerk JWT is missing 'role' metadata. Falling back to DB role: [${user.role}] for unblocking.`);
      role = user.role as string;
    }

    console.log(`🛡️ Middleware: Verified User [${clerk_id}] as Role [${role}]`);

    // Auto-sync if user doesn't exist (helpful for local dev / first-time login)
    if (!user) {
      const userCount = await User.countDocuments();
      const initialRole = userCount === 0 ? 'owner' : role;
      
      console.log(`📡 Middleware: Auto-syncing user [${clerk_id}] as [${initialRole}]`);
      try {
        user = await User.findOneAndUpdate(
          { clerk_id },
          { 
            $set: { 
              clerk_id, 
              role: initialRole as any, 
              full_name: 'New User', 
              email: 'pending@clerk.sync' 
            } 
          },
          { upsert: true, new: true }
        );
      } catch (syncErr: any) {
        console.error('❌ Middleware auto-sync failed:', syncErr.message);
      }
    }

    // 4. Attach to request object
    req.user = {
      clerk_id,
      role: role, 
      _id: user?._id as any
    };

    next();
  } catch (err: any) {
    console.error('Clerk Auth Error:', err.message);
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: err.message || 'Invalid or expired token' 
    });
  }
};
