import { Router } from 'express'
import { validatePromoCode } from '../controllers/promos.controller'
import { authenticateToken } from '../middleware/auth.middleware'

const router = Router()

router.post('/validate', authenticateToken, validatePromoCode)

export default router
