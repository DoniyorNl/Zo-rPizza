// backend/src/routes/tracking.routes.ts
import express from 'express'
import { authenticateToken } from '../middleware/firebase-auth.middleware'
import { isAdmin } from '../middleware/admin.middleware'
import {
	updateDriverLocation,
	getOrderTracking,
	startDeliveryTracking,
	completeDelivery,
	getActiveDeliveries,
} from '../controllers/tracking.controller'

const router = express.Router()

// Driver location update
router.post('/driver/location', authenticateToken, updateDriverLocation)

// Get order tracking
router.get('/order/:orderId', authenticateToken, getOrderTracking)

// Start delivery tracking
router.post('/order/:orderId/start', authenticateToken, startDeliveryTracking)

// Complete delivery
router.post('/order/:orderId/complete', authenticateToken, completeDelivery)

// Get active deliveries (admin only)
router.get('/active', authenticateToken, isAdmin, getActiveDeliveries)

export default router
