import { Router } from 'express'
import {
	clickCallback,
	getPaymentStatus,
	initiatePayment,
	paymeCallback,
	simulatePaymentSuccess,
} from '../controllers/payments.controller'
import { authenticateFirebaseToken } from '../middleware/firebase-auth.middleware'

const router = Router()

// User flow
router.post('/initiate', authenticateFirebaseToken, initiatePayment)
router.get('/:orderId/status', authenticateFirebaseToken, getPaymentStatus)

// Dev simulation
router.get('/simulate/:paymentId/success', simulatePaymentSuccess)

// Provider callbacks
router.post('/callback/click', clickCallback)
router.post('/callback/payme', paymeCallback)

export default router

