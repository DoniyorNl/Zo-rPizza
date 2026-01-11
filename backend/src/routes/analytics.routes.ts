// backend/src/routes/analytics.routes.ts
import { Router } from 'express'
import {
	getOverview,
	getRevenueData,
	getTopProducts,
	getCategoryStats,
	getRecentOrders,
} from '@/controllers/analytics.controller'

const router = Router()

router.get('/overview', getOverview)
router.get('/revenue', getRevenueData)
router.get('/top-products', getTopProducts)
router.get('/categories', getCategoryStats)
router.get('/recent-orders', getRecentOrders)

export default router
