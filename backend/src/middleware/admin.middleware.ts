// backend/src/middleware/admin.middleware.ts
import prisma from '@/lib/prisma'
import { NextFunction, Request, Response } from 'express'

// Extend Express Request type to include user
declare global {
	namespace Express {
		interface Request {
			user?: {
				id: string
				email: string
				role: string
				name: string | null
			}
		}
	}
}

// Rate limiting: Simple in-memory store (production da Redis ishlatish kerak)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Rate limit configuration
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minut
const RATE_LIMIT_MAX_REQUESTS = 60 // 1 minutda 60 ta request

/**
 * Check rate limit for IP address
 */
const checkRateLimit = (ip: string): boolean => {
	const now = Date.now()
	const record = rateLimitStore.get(ip)

	// Agar record yo'q yoki vaqti o'tgan bo'lsa - yangi record yaratish
	if (!record || now > record.resetTime) {
		rateLimitStore.set(ip, {
			count: 1,
			resetTime: now + RATE_LIMIT_WINDOW,
		})
		return true
	}

	// Agar limit oshib ketgan bo'lsa
	if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
		return false
	}

	// Count ni oshirish
	record.count++
	return true
}

/**
 * Clean up old rate limit records (har 5 minutda)
 */
setInterval(() => {
	const now = Date.now()
	for (const [ip, record] of rateLimitStore.entries()) {
		if (now > record.resetTime) {
			rateLimitStore.delete(ip)
		}
	}
}, 5 * 60 * 1000)

/**
 * Admin-only middleware
 * - Faqat ADMIN role bilan foydalanuvchilar kiradi
 * - Blocked userlar kirisha olmaydi
 * - Rate limiting bor
 * - Full logging
 */
export const adminOnly = async (req: Request, res: Response, next: NextFunction) => {
	const startTime = Date.now()
	const ip = req.ip || req.socket.remoteAddress || 'unknown'

	try {
		// 1. Rate limiting check
		if (!checkRateLimit(ip)) {
			console.warn(`[ADMIN_MIDDLEWARE] Rate limit exceeded for IP: ${ip}`)
			return res.status(429).json({
				success: false,
				message: 'Too many requests. Please try again later.',
				retryAfter: 60, // seconds
			})
		}

		// 2. Firebase UID headers'dan olish
		const userId = req.headers['x-user-id'] as string

		if (!userId) {
			console.warn(`[ADMIN_MIDDLEWARE] Unauthorized attempt (no x-user-id) from IP: ${ip}`)
			return res.status(401).json({
				success: false,
				message: "Kirish uchun avval tizimga kiring.",
				code: 'AUTH_REQUIRED',
			})
		}

		// 3. User'ni database'dan olish
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				email: true,
				name: true,
				role: true,
				isBlocked: true, // YANGI: blocked status
			},
		})

		// 4. User mavjudligini tekshirish (id = Firebase UID bo'lishi kerak)
		if (!user) {
			console.warn(`[ADMIN_MIDDLEWARE] User not found: ${userId} from IP: ${ip}`)
			return res.status(401).json({
				success: false,
				message:
					"Hisob topilmadi. Avval saytda ro'yxatdan o'ting. Admin uchun rolni ADMIN qilish kerak.",
				code: 'USER_NOT_FOUND',
			})
		}

		// 5. Blocked status tekshirish (YANGI)
		if (user.isBlocked) {
			console.warn(`[ADMIN_MIDDLEWARE] Blocked user attempted access: ${user.email} from IP: ${ip}`)
			return res.status(403).json({
				success: false,
				message: 'Your account has been blocked. Please contact support.',
			})
		}

		// 6. Admin role tekshirish
		if (user.role !== 'ADMIN') {
			console.warn(
				`[ADMIN_MIDDLEWARE] Non-admin user attempted access: ${user.email} (${user.role}) from IP: ${ip}`,
			)
			return res.status(403).json({
				success: false,
				message: 'Access denied. Admin privileges required.',
			})
		}

		// 7. Request object'ga user ma'lumotini qo'shish (YANGI)
		req.user = {
			id: user.id,
			email: user.email,
			role: user.role,
			name: user.name,
		}

		// 8. Success log
		const duration = Date.now() - startTime
		console.log(
			`[ADMIN_MIDDLEWARE] ✓ Admin access granted: ${user.email} | ${req.method} ${req.originalUrl} | ${duration}ms`,
		)

		return next()
	} catch (error) {
		const duration = Date.now() - startTime
		console.error(`[ADMIN_MIDDLEWARE] Error:`, {
			error: error instanceof Error ? error.message : 'Unknown error',
			ip,
			method: req.method,
			url: req.originalUrl,
			duration: `${duration}ms`,
		})

		return res.status(500).json({
			success: false,
			message: 'Internal server error. Please try again later.',
		})
	}
}

/**
 * Optional: Specific role checker middleware factory
 * Misol: roleOnly(['ADMIN', 'DELIVERY'])
 */
export const roleOnly = (allowedRoles: string[]) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			const userId = req.headers['x-user-id'] as string

			if (!userId) {
				return res.status(401).json({
					success: false,
					message: 'Authentication required',
				})
			}

			const user = await prisma.user.findUnique({
				where: { id: userId },
				select: {
					id: true,
					email: true,
					name: true,
					role: true,
					isBlocked: true,
				},
			})

			if (!user) {
				return res.status(401).json({
					success: false,
					message: 'User not found',
				})
			}

			if (user.isBlocked) {
				return res.status(403).json({
					success: false,
					message: 'Account blocked',
				})
			}

			if (!allowedRoles.includes(user.role)) {
				return res.status(403).json({
					success: false,
					message: `Access denied. Allowed roles: ${allowedRoles.join(', ')}`,
				})
			}

			req.user = {
				id: user.id,
				email: user.email,
				role: user.role,
				name: user.name,
			}

			return next()
		} catch (error) {
			console.error('[ROLE_MIDDLEWARE] Error:', error)
			return res.status(500).json({
				success: false,
				message: 'Server error',
			})
		}
	}
}

/**
 * Optional: Auth middleware (any authenticated user)
 */
export const authRequired = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const userId = req.headers['x-user-id'] as string

		if (!userId) {
			return res.status(401).json({
				success: false,
				message: 'Authentication required',
			})
		}

		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				email: true,
				name: true,
				role: true,
				isBlocked: true,
			},
		})

		if (!user) {
			return res.status(401).json({
				success: false,
				message: 'User not found',
			})
		}

		if (user.isBlocked) {
			return res.status(403).json({
				success: false,
				message: 'Account blocked',
			})
		}

		req.user = {
			id: user.id,
			email: user.email,
			role: user.role,
			name: user.name,
		}

		return next()
	} catch (error) {
		console.error('[AUTH_MIDDLEWARE] Error:', error)
		return res.status(500).json({
			success: false,
			message: 'Server error',
		})
	}
}
