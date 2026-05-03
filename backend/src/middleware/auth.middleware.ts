export { authenticateSupabaseToken as authenticateToken, optionalAuth } from './supabase-auth.middleware'
export type { AuthRequest } from './supabase-auth.middleware'

import { Request, Response, NextFunction } from 'express'
import type { AuthRequest } from './supabase-auth.middleware'

export const requireAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.userId) {
    return res.status(401).json({ success: false, message: 'Autentifikatsiya talab qilinadi.' })
  }
  next()
}
