// backend/src/controllers/loyalty.controller.ts
// 🍕 LOYALTY PROGRAM - balance, earn, redeem

import { Request, Response } from 'express'
import { REDEEM_POINTS_PER_CURRENCY } from '../constants/loyalty'
import prisma from '../lib/prisma'
import type { AuthRequest } from '../middleware/firebase-auth.middleware'

const POINTS_PER_CURRENCY = 1
const REDEEM_POINTS_PER_CURRENCY = 100

/** GET /api/loyalty/balance - Foydalanuvchi ballari */
export const getBalance = async (req: Request, res: Response) => {
	try {
		const authReq = req as AuthRequest
		const firebaseUid = authReq.userId
		if (!firebaseUid) {
			return res.status(401).json({ success: false, message: 'Unauthorized' })
		}
		const user = await prisma.user.findFirst({
			where: { firebaseUid },
			select: { id: true, loyaltyPoints: true, totalSpent: true },
		})
		if (!user) {
			return res.status(200).json({ success: true, data: { points: 0, totalSpent: 0 } })
		}
		return res.status(200).json({
			success: true,
			data: {
				points: user.loyaltyPoints,
				totalSpent: user.totalSpent,
				redeemableDiscount: Math.floor(user.loyaltyPoints / REDEEM_POINTS_PER_CURRENCY),
			},
		})
	} catch (error) {
		console.error('Loyalty balance error:', error)
		return res.status(500).json({ success: false, message: 'Server error' })
	}
}

/** POST /api/loyalty/redeem - Ballarni chegirma sifatida ishlatish (order yaratishda) */
export const getRedeemOptions = async (req: Request, res: Response) => {
	try {
		const authReq = req as AuthRequest
		const firebaseUid = authReq.userId
		if (!firebaseUid) {
			return res.status(401).json({ success: false, message: 'Unauthorized' })
		}
		const user = await prisma.user.findFirst({
			where: { firebaseUid },
			select: { loyaltyPoints: true },
		})
		const points = user?.loyaltyPoints ?? 0
		const maxDiscount = Math.floor(points / REDEEM_POINTS_PER_CURRENCY)
		return res.status(200).json({
			success: true,
			data: {
				points,
				pointsPerCurrency: REDEEM_POINTS_PER_CURRENCY,
				maxDiscount,
			},
		})
	} catch (error) {
		console.error('Loyalty redeem options error:', error)
		return res.status(500).json({ success: false, message: 'Server error' })
	}
}

/** GET /api/loyalty/transactions - Ballar tarixi */
export const getTransactions = async (req: Request, res: Response) => {
	try {
		const authReq = req as AuthRequest
		const firebaseUid = authReq.userId
		if (!firebaseUid) {
			return res.status(401).json({ success: false, message: 'Unauthorized' })
		}
		const user = await prisma.user.findFirst({
			where: { firebaseUid },
			select: { id: true },
		})
		if (!user) {
			return res.status(200).json({ success: true, data: [] })
		}
		const transactions = await prisma.loyaltyTransaction.findMany({
			where: { userId: user.id },
			orderBy: { createdAt: 'desc' },
			take: 50,
		})
		return res.status(200).json({ success: true, data: transactions })
	} catch (error) {
		console.error('Loyalty transactions error:', error)
		return res.status(500).json({ success: false, message: 'Server error' })
	}
}

