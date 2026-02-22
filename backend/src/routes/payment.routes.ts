import { Router } from 'express'
import { createPaymentIntent, stripeWebhook } from '../controllers/payment.controller'
import { authenticateFirebaseToken } from '../middleware/firebase-auth.middleware'

const router = Router()

// Webhook raw body server.ts da express.raw() bilan ulangan bo'ladi; bu yerda faqat create-intent
router.post('/create-intent', authenticateFirebaseToken, createPaymentIntent)

export default router
export { stripeWebhook }
