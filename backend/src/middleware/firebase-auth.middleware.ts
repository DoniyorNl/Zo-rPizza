// backend/src/middleware/firebase-auth.middleware.ts
import { Request, Response, NextFunction } from 'express'
import { auth } from '../config/firebase'

// Custom Request interface (userId qo'shish uchun)
export interface AuthRequest extends Request {
	userId?: string
	userEmail?: string
	userRole?: string
}

/**
 * Firebase ID Token Verification Middleware
 * Frontend dan kelgan Bearer token ni tekshiradi
 */
export const authenticateFirebaseToken = async (
	req: AuthRequest,
	res: Response,
	next: NextFunction
) => {
	try {
		// 1. Authorization header dan token olish
		const authHeader = req.headers.authorization
		const token = authHeader?.startsWith('Bearer ') ? authHeader.split('Bearer ')[1] : null

		if (!token) {
			return res.status(401).json({
				success: false,
				message: 'Token topilmadi. Iltimos, tizimga kiring.',
			})
		}

		// 2. Firebase Admin SDK orqali token tekshirish
		const decodedToken = await auth.verifyIdToken(token)

		// 3. User ma'lumotlarini request object ga qo'shish
		req.userId = decodedToken.uid
		req.userEmail = decodedToken.email
		req.userRole = decodedToken.role || 'customer' // custom claims dan

		// 4. Keyingi middleware/controller ga o'tish
		next()
	} catch (error: any) {
		console.error('🔒 Firebase Auth Error:', error.code, error.message)

		// Token muddati tugagan
		if (error.code === 'auth/id-token-expired') {
			return res.status(401).json({
				success: false,
				message: 'Token muddati tugagan. Qaytadan kiring.',
				code: 'TOKEN_EXPIRED',
			})
		}

		// Token noto'g'ri
		if (error.code === 'auth/argument-error' || error.code === 'auth/invalid-credential') {
			return res.status(401).json({
				success: false,
				message: 'Noto\'g\'ri token. Qaytadan kiring.',
				code: 'INVALID_TOKEN',
			})
		}

		// Boshqa xatolar
		return res.status(403).json({
			success: false,
			message: 'Autentifikatsiya xatosi.',
			code: error.code || 'AUTH_ERROR',
		})
	}
}

/**
 * Admin Role Middleware
 * Faqat admin huquqiga ega foydalanuvchilar o'ta oladi
 */
export const requireAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
	try {
		if (!req.userId) {
			return res.status(401).json({
				success: false,
				message: 'Autentifikatsiya talab qilinadi.',
			})
		}

		// Firebase dan user ma'lumotlarini olish
		const user = await auth.getUser(req.userId)

		// Custom claims tekshirish
		const isAdmin = user.customClaims?.admin === true || user.customClaims?.role === 'admin'

		if (!isAdmin) {
			return res.status(403).json({
				success: false,
				message: 'Sizda admin huquqlari yo\'q. Faqat adminlar kirishi mumkin.',
			})
		}

		// Admin ekanligini request ga qo'shish
		req.userRole = 'admin'
		next()
	} catch (error: any) {
		console.error('🔒 Admin Check Error:', error.message)
		return res.status(500).json({
			success: false,
			message: 'Admin huquqlarini tekshirishda xatolik.',
		})
	}
}

/**
 * Optional Auth Middleware
 * Token bo'lsa tekshiradi, bo'lmasa ham davom etadi
 */
export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
	try {
		const authHeader = req.headers.authorization
		const token = authHeader?.startsWith('Bearer ') ? authHeader.split('Bearer ')[1] : null

		if (token) {
			const decodedToken = await auth.verifyIdToken(token)
			req.userId = decodedToken.uid
			req.userEmail = decodedToken.email
			req.userRole = decodedToken.role || 'customer'
		}

		// Token bo'lmasa ham davom etadi
		next()
	} catch (error) {
		// Xato bo'lsa ham davom etadi
		next()
	}
}