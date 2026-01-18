// backend/src/routes/firebase-auth.routes.ts
import { Router } from 'express'
import { firebaseAuthController } from '../controllers/firebase-auth.controller'
import { adminOnly } from '../middleware/admin.middleware'
import { authenticateToken } from '../middleware/auth.middleware'

const router = Router()

// ============================================
// PUBLIC ROUTES (Token tekshirilmaydi)
// ============================================

/**
 * GET /api/auth/status
 * Firebase Auth holatini tekshirish
 */
router.get('/status', (_req, res) => {
	res.status(200).json({
		success: true,
		message: 'Firebase Auth is ready',
		timestamp: new Date().toISOString(),
	})
})

// ============================================
// PROTECTED ROUTES (Token kerak)
// ============================================

/**
 * GET /api/auth/verify-token
 * Frontend dan kelgan tokenni tekshirish
 * Test maqsadida
 */
router.get('/verify-token', authenticateToken, firebaseAuthController.verifyToken)

/**
 * GET /api/auth/me
 * Hozirgi foydalanuvchi ma'lumotlarini olish
 * Firebase + Database ma'lumotlari
 */
router.get('/me', authenticateToken, firebaseAuthController.getCurrentUser)

/**
 * POST /api/auth/sync
 * Firebase user ni database bilan sinxronlashtirish
 * Frontend login/signup dan keyin chaqiriladi
 */
router.post('/sync', authenticateToken, firebaseAuthController.syncUser)

// ============================================
// ADMIN ROUTES (Admin huquqi kerak)
// ============================================

/**
 * POST /api/auth/set-admin
 * User ga admin rolini berish
 * Body: { uid: string }
 */
router.post('/set-admin', authenticateToken, adminOnly, firebaseAuthController.setAdminRole)

/**
 * POST /api/auth/remove-admin
 * Admin rolini olib tashlash
 * Body: { uid: string }
 */
router.post(
	'/remove-admin',
	authenticateToken,
	adminOnly,
	firebaseAuthController.removeAdminRole
)

/**
 * GET /api/auth/users
 * Barcha userlarni olish (faqat admin)
 */
router.get('/users', authenticateToken, adminOnly, firebaseAuthController.getAllFirebaseUsers)

export default router