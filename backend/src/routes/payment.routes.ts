import { Router } from 'express'
import { createPaymentIntent, stripeWebhook } from '../controllers/payment.controller'
import { authenticateToken } from '../middleware/auth.middleware'

const router = Router()

router.post('/create-intent', authenticateToken, createPaymentIntent)

export default router
export { stripeWebhook }
