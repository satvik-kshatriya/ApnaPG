import { Request, Response, NextFunction } from 'express';

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role || 'none';
    
    if (!req.user || !allowedRoles.includes(userRole)) {
      console.log(`🚫 Authorization Failed (JWT-verified): User [${req.user?.clerk_id || 'unknown'}] with token role '${userRole}' not in [${allowedRoles.join(', ')}]`);
      return res.status(403).json({ 
        error: 'Forbidden', 
        message: `Role '${userRole}' is not authorized. Required: ${allowedRoles.join(' or ')}` 
      });
    }
    next();
  };
};
