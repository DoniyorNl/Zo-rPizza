// backend/src/routes/dashboard.routes.ts

import { Router } from 'express'
import { getDashboardData } from '../controllers/dashboard.controller'
// import { adminMiddleware } from '../middleware/admin.middleware'; // Agar kerak bo'lsa

const router = Router()

/**
 * @route   GET /api/dashboard
 * @desc    Get real-time dashboard statistics
 * @access  Public (yoki adminMiddleware qo'shish mumkin)
 *
 * RESPONSE:
 * {
 *   success: true,
 *   data: {
 *     stats: { todayRevenue, todayOrders, activeOrders, ... },
 *     liveOrders: [...],
 *     topProductsToday: [...],
 *     hourlyRevenue: [...]
 *   },
 *   timestamp: "2025-01-17T..."
 * }
 */
router.get('/', getDashboardData)
// router.get('/', adminMiddleware, getDashboardData); // ✅ Admin uchun

export default router
