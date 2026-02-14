// backend/src/controllers/promos.controller.ts
// 🍕 PROMO CODES - validate & apply (user-facing)

import { Request, Response } from 'express'
import prisma from '../lib/prisma'
import type { AuthRequest } from '../middleware/firebase-auth.middleware'

/** POST /api/promos/validate - Kodni tekshirish (cart total bilan) */
export const validatePromoCode = async (req: Request, res: Response) => {
	try {
		const { code, orderTotal } = req.body
		const authReq = req as AuthRequest
		const userId = authReq.userId
		const dbUser = userId
			? await prisma.user.findFirst({ where: { firebaseUid: userId } })
			: null
		const orderTotalNum = Number(orderTotal)
		if (!code || typeof code !== 'string') {
			return res.status(400).json({ success: false, message: 'Code is required' })
		}
		const coupon = await prisma.coupon.findUnique({
			where: { code: code.trim().toUpperCase(), isActive: true },
		})
		if (!coupon) {
			return res.status(200).json({
				success: true,
				valid: false,
				message: 'Promo code not found or inactive',
			})
		}
		const now = new Date()
		if (coupon.startsAt && now < coupon.startsAt) {
			return res.status(200).json({
				success: true,
				valid: false,
				message: 'Promo code not yet active',
			})
		}
		if (coupon.endsAt && now > coupon.endsAt) {
			return res.status(200).json({
				success: true,
				valid: false,
				message: 'Promo code has expired',
			})
		}
		const minOrder = coupon.minOrderTotal ?? 0
		if (orderTotalNum < minOrder) {
			return res.status(200).json({
				success: true,
				valid: false,
				message: `Minimum order total: ${minOrder}`,
			})
		}
		if (coupon.usageLimit != null) {
			const used = await prisma.couponUsage.count({ where: { couponId: coupon.id } })
			if (used >= coupon.usageLimit) {
				return res.status(200).json({
					success: true,
					valid: false,
					message: 'Promo code usage limit reached',
				})
			}
		}
		if (coupon.perUserLimit != null && dbUser) {
			const userUsed = await prisma.couponUsage.count({
				where: { userId: dbUser.id, couponId: coupon.id },
			})
			if (userUsed >= coupon.perUserLimit) {
				return res.status(200).json({
					success: true,
					valid: false,
					message: 'You have already used this code',
				})
			}
		}
		const discount =
			coupon.discountType === 'PERCENT'
				? (orderTotalNum * coupon.discountValue) / 100
				: Math.min(coupon.discountValue, orderTotalNum)
		return res.status(200).json({
			success: true,
			valid: true,
			message: 'Valid',
			data: {
				couponId: coupon.id,
				code: coupon.code,
				discountAmount: Math.round(discount * 100) / 100,
				discountType: coupon.discountType,
				discountValue: coupon.discountValue,
			},
		})
	} catch (error) {
		console.error('Validate promo error:', error)
		return res.status(500).json({ success: false, message: 'Server error' })
	}
}
