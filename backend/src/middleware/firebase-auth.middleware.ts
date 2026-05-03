// backend/src/middleware/firebase-auth.middleware.ts
// Supabase Auth middleware (replaces Firebase Auth)
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  userId?: string
  userEmail?: string
  userRole?: string
}

const verifySupabaseToken = (token: string) => {
  try {
    const secret = process.env.SUPABASE_JWT_SECRET
    if (!secret) throw new Error('SUPABASE_JWT_SECRET not configured')
    return jwt.verify(token, secret) as { sub: string; email?: string }
  } catch {
    return null
  }
}

export const authenticateFirebaseToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split('Bearer ')[1] : null

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token topilmadi. Iltimos, tizimga kiring.',
    })
  }

  const decoded = verifySupabaseToken(token)
  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: 'Token yaroqsiz yoki muddati tugagan.',
      code: 'INVALID_TOKEN',
    })
  }

  req.userId = decoded.sub
  req.userEmail = decoded.email
  next()
}

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split('Bearer ')[1] : null

  if (token) {
    const decoded = verifySupabaseToken(token)
    if (decoded) {
      req.userId = decoded.sub
      req.userEmail = decoded.email
    }
  }
  next()
}
