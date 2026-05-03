// backend/src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  userId?: string
  userEmail?: string
  userRole?: string
}

const verifySupabaseToken = (token: string): { sub: string; email?: string } | null => {
  try {
    const secret = process.env.SUPABASE_JWT_SECRET
    if (!secret) throw new Error('SUPABASE_JWT_SECRET not set')
    const decoded = jwt.verify(token, secret) as { sub: string; email?: string; role?: string }
    return decoded
  } catch {
    return null
  }
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split('Bearer ')[1] : null

  if (!token) {
    return res.status(401).json({ success: false, message: "Token topilmadi. Tizimga kiring." })
  }

  const decoded = verifySupabaseToken(token)
  if (!decoded) {
    return res.status(401).json({ success: false, message: "Token yaroqsiz yoki muddati tugagan." })
  }

  req.userId = decoded.sub
  req.userEmail = decoded.email
  next()
}

export const requireAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.userId) {
    return res.status(401).json({ success: false, message: "Autentifikatsiya talab qilinadi." })
  }
  // Role check handled by admin.middleware.ts
  next()
}
