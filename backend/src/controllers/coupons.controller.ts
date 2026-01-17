// backend/src/controllers/coupons.controller.ts
// 🍕 COUPONS CONTROLLER

import { Request, Response } from 'express'
import prisma from '../lib/prisma'
import { createCouponSchema, updateCouponSchema } from '../validators/coupon.validator'

const getParamString = (value: unknown): string | undefined => {
	if (typeof value === 'string') return value
	if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
	return undefined
}

export const getAllCoupons = async (_req: Request, res: Response) => {
	try {
		const coupons = await prisma.coupon.findMany({
			orderBy: { createdAt: 'desc' },
		})

		return res.status(200).json({
			success: true,
			count: coupons.length,
			data: coupons,
		})
	} catch (error) {
		console.error('Error fetching coupons:', error)
		return res.status(500).json({ success: false, message: 'Server error' })
	}
}

export const getCouponById = async (req: Request, res: Response) => {
	try {
		const id = getParamString((req.params as any).id)
		if (!id) {
			return res.status(400).json({ success: false, message: 'Invalid id' })
		}
		const coupon = await prisma.coupon.findUnique({ where: { id } })
		if (!coupon) {
			return res.status(404).json({ success: false, message: 'Coupon not found' })
		}
		return res.status(200).json({ success: true, data: coupon })
	} catch (error) {
		console.error('Error fetching coupon:', error)
		return res.status(500).json({ success: false, message: 'Server error' })
	}
}

export const createCoupon = async (req: Request, res: Response) => {
	try {
		const validation = createCouponSchema.safeParse(req.body)
		if (!validation.success) {
			return res.status(400).json({
				success: false,
				message: 'Validation error',
				errors: validation.error.flatten(),
			})
		}

		const coupon = await prisma.coupon.create({
			data: validation.data,
		})

		return res.status(201).json({
			success: true,
			message: 'Coupon created successfully',
			data: coupon,
		})
	} catch (error) {
		console.error('Error creating coupon:', error)
		return res.status(500).json({ success: false, message: 'Server error' })
	}
}

export const updateCoupon = async (req: Request, res: Response) => {
	try {
		const id = getParamString((req.params as any).id)
		if (!id) {
			return res.status(400).json({ success: false, message: 'Invalid id' })
		}
		const validation = updateCouponSchema.safeParse(req.body)
		if (!validation.success) {
			return res.status(400).json({
				success: false,
				message: 'Validation error',
				errors: validation.error.flatten(),
			})
		}

		const existing = await prisma.coupon.findUnique({ where: { id } })
		if (!existing) {
			return res.status(404).json({ success: false, message: 'Coupon not found' })
		}

		const coupon = await prisma.coupon.update({
			where: { id },
			data: validation.data,
		})

		return res.status(200).json({
			success: true,
			message: 'Coupon updated successfully',
			data: coupon,
		})
	} catch (error) {
		console.error('Error updating coupon:', error)
		return res.status(500).json({ success: false, message: 'Server error' })
	}
}

export const deleteCoupon = async (req: Request, res: Response) => {
	try {
		const id = getParamString((req.params as any).id)
		if (!id) {
			return res.status(400).json({ success: false, message: 'Invalid id' })
		}
		const existing = await prisma.coupon.findUnique({ where: { id } })
		if (!existing) {
			return res.status(404).json({ success: false, message: 'Coupon not found' })
		}

		await prisma.coupon.delete({ where: { id } })

		return res.status(200).json({
			success: true,
			message: 'Coupon deleted successfully',
		})
	} catch (error) {
		console.error('Error deleting coupon:', error)
		return res.status(500).json({ success: false, message: 'Server error' })
	}
}
