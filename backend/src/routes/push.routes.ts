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
import { firebaseAuth } from '../middleware/firebase-auth.middleware'

const router = Router()

// Public route - Get VAPID public key
router.get('/vapid-public-key', getVapidPublicKey)

// Protected routes - Require authentication
router.post('/subscribe', firebaseAuth, subscribeToPush)
router.post('/unsubscribe', firebaseAuth, unsubscribeFromPush)
router.get('/subscriptions', firebaseAuth, getUserSubscriptions)
router.post('/test', firebaseAuth, sendTestNotification)

export default router
