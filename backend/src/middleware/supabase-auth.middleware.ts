import { Request, Response, NextFunction } from 'express'
import { supabaseAdmin } from '../config/supabase'

export interface AuthRequest extends Request {
  userId?: string
  userEmail?: string
  userRole?: string
}

const tokenCache = new Map<string, { userId: string; email: string; expiresAt: number }>()
const CACHE_TTL_MS = 60 * 1000

const verifyToken = async (token: string): Promise<{ sub: string; email?: string } | null> => {
  const cached = tokenCache.get(token)
  if (cached && cached.expiresAt > Date.now()) {
    return { sub: cached.userId, email: cached.email }
  }

  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token)
    if (error || !data?.user) return null

    tokenCache.set(token, {
      userId: data.user.id,
      email: data.user.email ?? '',
      expiresAt: Date.now() + CACHE_TTL_MS,
    })

    if (tokenCache.size > 500) {
      const now = Date.now()
      for (const [key, value] of tokenCache.entries()) {
        if (value.expiresAt < now) tokenCache.delete(key)
      }
    }

    return { sub: data.user.id, email: data.user.email ?? '' }
  } catch {
    return null
  }
}

export const authenticateSupabaseToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split('Bearer ')[1] : null

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token topilmadi. Iltimos, tizimga kiring.',
    })
  }

  const decoded = await verifyToken(token)
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
    const decoded = await verifyToken(token)
    if (decoded) {
      req.userId = decoded.sub
      req.userEmail = decoded.email
    }
  }
  next()
}
