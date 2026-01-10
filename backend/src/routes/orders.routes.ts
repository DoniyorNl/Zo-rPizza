// backend/src/routes/orders.routes.ts
// 🍕 ORDERS ROUTES

import { Router } from 'express'
import {
	getAllOrders,
	getOrderById,
	createOrder,
	updateOrderStatus,
	deleteOrder,
	getUserOrders,
} from '@/controllers/orders.controller'
import { adminOnly } from '../middleware/admin.middleware'

const router = Router()

// ✅ ADMIN ROUTES (adminOnly middleware bilan)
router.get('/admin/all', adminOnly, getAllOrders) // Admin - barcha buyurtmalar
router.patch('/admin/:id/status', adminOnly, updateOrderStatus) // Admin - status o'zgartirish

// ✅ USER ROUTES
router.get('/user/:userId', getUserOrders) // User buyurtmalari
router.get('/:id', getOrderById) // Bitta buyurtma
router.post('/', createOrder) // Yangi buyurtma
router.delete('/:id', deleteOrder) // Buyurtma o'chirish

export default router
