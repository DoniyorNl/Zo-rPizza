// backend/src/middleware/auth.middleware.ts
// Re-exports the shared Supabase auth middleware
export { authenticateFirebaseToken as authenticateToken, optionalAuth } from './firebase-auth.middleware'
export type { AuthRequest } from './firebase-auth.middleware'

import { Request, Response, NextFunction } from 'express'
import type { AuthRequest } from './firebase-auth.middleware'

export const requireAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.userId) {
    return res.status(401).json({ success: false, message: 'Autentifikatsiya talab qilinadi.' })
  }
  // Role check handled by admin.middleware.ts
  next()
}
