// backend/src/routes/tracking.routes.ts
import express from 'express'
import {
	adminSimulateDriverLocation,
	completeDelivery,
	getActiveDeliveries,
	getOrderTracking,
	startDeliveryTracking,
	updateDriverLocation,
} from '../controllers/tracking.controller'
import { adminOnly } from '../middleware/admin.middleware'
import { authenticateFirebaseToken } from '../middleware/firebase-auth.middleware'
import { resolveDbUser } from '../middleware/resolve-db-user.middleware'

const router = express.Router()

const authWithDbUser = [authenticateFirebaseToken, resolveDbUser]

// Admin: haydovchi joyini simulyatsiya (test uchun)
router.post('/admin/simulate-location', authenticateFirebaseToken, adminOnly, adminSimulateDriverLocation)

// Driver location update
router.post('/driver/location', ...authWithDbUser, updateDriverLocation)

// Get order tracking
router.get('/order/:orderId', ...authWithDbUser, getOrderTracking)

// Start delivery tracking
router.post('/order/:orderId/start', ...authWithDbUser, startDeliveryTracking)

// Complete delivery
router.post('/order/:orderId/complete', ...authWithDbUser, completeDelivery)

// Get active deliveries (admin only)
router.get('/active', adminOnly, getActiveDeliveries)

export default router
