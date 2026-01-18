// backend/src/routes/auth.routes.ts
import { Router } from 'express'
import { authController } from '../controllers/auth.controller'
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware'

const router = Router()

// Hozirgi foydalanuvchi ma'lumotlarini olish (himoyalangan)
router.get('/me', authenticateToken, authController.getCurrentUser)

// Admin rolini berish (faqat admin)
router.post('/set-admin', authenticateToken, requireAdmin, authController.setAdminRole)

export default router