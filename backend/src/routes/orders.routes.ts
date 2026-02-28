// backend/src/routes/orders.routes.ts
// 🍕 ORDERS ROUTES

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
import { authenticateFirebaseToken, optionalAuth } from '../middleware/firebase-auth.middleware'

const router = Router()

// ✅ ADMIN ROUTES (adminOnly middleware bilan)
router.get('/admin/all', adminOnly, getAllOrders) // Admin - barcha buyurtmalar
router.patch('/admin/:id/status', adminOnly, updateOrderStatus) // Admin - status o'zgartirish

// ✅ DRIVER ROUTES
router.get('/driver', authenticateFirebaseToken, getDriverOrders) // Driver buyurtmalari

// ✅ USER ROUTES
router.get('/user/:userId', authenticateFirebaseToken, getUserOrders) // User buyurtmalari
// 🆕 optionalAuth: token bo'lsa userId qo'shadi, bo'lmasa ham guest buyurtma berish mumkin
router.post('/', optionalAuth, createOrder) // Yangi buyurtma (guest + registered)

// ✅ FALLBACK - GET /api/orders (bo'sh array qaytarish)
router.get('/', (_req, res) => {
	res.status(200).json({
		success: true,
		message: 'Please use /api/orders/user/:userId to get user orders',
		data: [],
		count: 0,
	})
})

router.get('/:id', authenticateFirebaseToken, getOrderById) // Bitta buyurtma
router.post('/:id/reorder', authenticateFirebaseToken, reorder) // Qayta buyurtma
router.delete('/:id', authenticateFirebaseToken, deleteOrder) // Buyurtma o'chirish

export default router
