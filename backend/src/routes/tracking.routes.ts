// backend/src/routes/tracking.routes.ts
import express from 'express'
import { authenticateFirebaseToken } from '../middleware/firebase-auth.middleware'
import { adminOnly } from '../middleware/admin.middleware'
import {
	updateDriverLocation,
	getOrderTracking,
	startDeliveryTracking,
	completeDelivery,
	getActiveDeliveries,
} from '../controllers/tracking.controller'

const router = express.Router()

// Driver location update
router.post('/driver/location', authenticateFirebaseToken, updateDriverLocation)

// Get order tracking
router.get('/order/:orderId', authenticateFirebaseToken, getOrderTracking)

// Start delivery tracking
router.post('/order/:orderId/start', authenticateFirebaseToken, startDeliveryTracking)

// Complete delivery
router.post('/order/:orderId/complete', authenticateFirebaseToken, completeDelivery)

// Get active deliveries (admin only)
router.get('/active', adminOnly, getActiveDeliveries)

export default router
