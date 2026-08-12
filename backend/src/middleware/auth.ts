import { requireAuth } from '@clerk/express';
import { Request, Response, NextFunction } from 'express';

// Extend Express Request to include user for legacy route compatibility
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
      };
      auth?: {
        userId: string;
      };
    }
  }
}

// Wrap Clerk's requireAuth to map req.auth to req.user for legacy routes
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  // First run Clerk's requireAuth
  requireAuth()(req, res, (err) => {
    if (err) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Map Clerk's auth.userId to user.userId for existing routes
    if (req.auth && req.auth.userId) {
      req.user = {
        userId: req.auth.userId
      };
    }
    
    next();
  });
};

