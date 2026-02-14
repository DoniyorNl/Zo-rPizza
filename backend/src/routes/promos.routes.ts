// backend/src/routes/promos.routes.ts
import { Router } from 'express'
import { validatePromoCode } from '../controllers/promos.controller'
import { authenticateFirebaseToken } from '../middleware/firebase-auth.middleware'

const router = Router()

// Optional auth: for per-user limit check
router.post('/validate', authenticateFirebaseToken, validatePromoCode)

export default router
