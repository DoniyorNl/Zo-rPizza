import {
	createOrder,
	deleteOrder,
	getAllOrders,
	getDriverOrders,
	getOrderById,
	getUserOrders,
	reorder,
	updateOrderStatus,
} from '@/controllers/orders.controller'
import { Router } from 'express'
import { adminOnly } from '../middleware/admin.middleware'
import { authenticateToken, optionalAuth } from '../middleware/auth.middleware'

const router = Router()

router.get('/admin/all', adminOnly, getAllOrders)
router.patch('/admin/:id/status', adminOnly, updateOrderStatus)

router.get('/driver', authenticateToken, getDriverOrders)
router.get('/user/:userId', authenticateToken, getUserOrders)
router.post('/', optionalAuth, createOrder)

router.get('/', (_req, res) => {
	res.status(200).json({
		success: true,
		message: 'Please use /api/orders/user/:userId to get user orders',
		data: [],
		count: 0,
	})
})

router.get('/:id', authenticateToken, getOrderById)
router.post('/:id/reorder', authenticateToken, reorder)
router.delete('/:id', authenticateToken, deleteOrder)

export default router
