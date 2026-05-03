import { Router } from 'express'
import {
	clickCallback,
	getPaymentStatus,
	initiatePayment,
	paymeCallback,
	simulatePaymentSuccess,
} from '../controllers/payments.controller'
import { authenticateToken } from '../middleware/auth.middleware'

const router = Router()

router.post('/initiate', authenticateToken, initiatePayment)
router.get('/:orderId/status', authenticateToken, getPaymentStatus)

router.get('/simulate/:paymentId/success', simulatePaymentSuccess)

router.post('/callback/click', clickCallback)
router.post('/callback/payme', paymeCallback)

export default router
