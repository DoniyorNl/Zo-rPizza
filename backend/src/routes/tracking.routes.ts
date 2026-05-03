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
import { authenticateToken } from '../middleware/auth.middleware'
import { resolveDbUser } from '../middleware/resolve-db-user.middleware'

const router = express.Router()

const authWithDbUser = [authenticateToken, resolveDbUser]

router.post('/admin/simulate-location', authenticateToken, adminOnly, adminSimulateDriverLocation)

router.post('/driver/location', ...authWithDbUser, updateDriverLocation)
router.get('/order/:orderId', ...authWithDbUser, getOrderTracking)
router.post('/order/:orderId/start', ...authWithDbUser, startDeliveryTracking)
router.post('/order/:orderId/complete', ...authWithDbUser, completeDelivery)

router.get('/active', adminOnly, getActiveDeliveries)

export default router
