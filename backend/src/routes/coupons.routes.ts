// backend/src/routes/coupons.routes.ts
// 🍕 COUPONS ROUTES

import {
	createCoupon,
	deleteCoupon,
	getAllCoupons,
	getCouponById,
	updateCoupon,
} from '@/controllers/coupons.controller'
import { Router } from 'express'

const router = Router()

router.get('/', getAllCoupons)
router.get('/:id', getCouponById)
router.post('/', createCoupon)
router.put('/:id', updateCoupon)
router.delete('/:id', deleteCoupon)

export default router
