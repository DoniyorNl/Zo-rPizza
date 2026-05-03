// backend/src/routes/push.routes.ts
// 🔔 PUSH NOTIFICATION ROUTES

import { Router } from 'express'
import {
	subscribeToPush,
	unsubscribeFromPush,
	getUserSubscriptions,
	getVapidPublicKey,
	sendTestNotification,
} from '../controllers/push.controller'
import { authenticateFirebaseToken } from '../middleware/firebase-auth.middleware'

const router = Router()

// Public route - Get VAPID public key
router.get('/vapid-public-key', getVapidPublicKey)

// Protected routes - Require authentication
router.post('/subscribe', authenticateFirebaseToken, subscribeToPush)
router.post('/unsubscribe', authenticateFirebaseToken, unsubscribeFromPush)
router.get('/subscriptions', authenticateFirebaseToken, getUserSubscriptions)
router.post('/test', authenticateFirebaseToken, sendTestNotification)

export default router
