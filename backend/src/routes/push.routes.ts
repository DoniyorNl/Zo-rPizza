import { Router } from 'express'
import {
	subscribeToPush,
	unsubscribeFromPush,
	getUserSubscriptions,
	getVapidPublicKey,
	sendTestNotification,
} from '../controllers/push.controller'
import { authenticateToken } from '../middleware/auth.middleware'

const router = Router()

router.get('/vapid-public-key', getVapidPublicKey)

router.post('/subscribe', authenticateToken, subscribeToPush)
router.post('/unsubscribe', authenticateToken, unsubscribeFromPush)
router.get('/subscriptions', authenticateToken, getUserSubscriptions)
router.post('/test', authenticateToken, sendTestNotification)

export default router
