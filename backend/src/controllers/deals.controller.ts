// backend/src/controllers/deals.controller.ts
// 🍕 DEALS CONTROLLER

import { Request, Response } from 'express'
import prisma from '../lib/prisma'
import { createDealSchema, updateDealSchema } from '../validators/deal.validator'

const getParamString = (value: unknown): string | undefined => {
	if (typeof value === 'string') return value
	if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
	return undefined
}

export const getAllDeals = async (_req: Request, res: Response) => {
	try {
		const deals = await prisma.deal.findMany({
			include: {
				items: {
					include: {
						product: true,
					},
				},
			},
			orderBy: { createdAt: 'desc' },
		})

		return res.status(200).json({
			success: true,
			count: deals.length,
			data: deals,
		})
	} catch (error) {
		console.error('Error fetching deals:', error)
		return res.status(500).json({
			success: false,
			message: 'Server error',
		})
	}
}

export const getDealById = async (req: Request, res: Response) => {
	try {
		const id = getParamString((req.params as any).id)
		if (!id) {
			return res.status(400).json({ success: false, message: 'Invalid id' })
		}
		const deal = await prisma.deal.findUnique({
			where: { id },
			include: {
				items: {
					include: {
						product: true,
					},
				},
			},
		})

		if (!deal) {
			return res.status(404).json({ success: false, message: 'Deal not found' })
		}

		return res.status(200).json({ success: true, data: deal })
	} catch (error) {
		console.error('Error fetching deal:', error)
		return res.status(500).json({ success: false, message: 'Server error' })
	}
}

export const createDeal = async (req: Request, res: Response) => {
	try {
		const validation = createDealSchema.safeParse(req.body)
		if (!validation.success) {
			return res.status(400).json({
				success: false,
				message: 'Validation error',
				errors: validation.error.format(),
			})
		}

		const { items, ...dealData } = validation.data

		const deal = await prisma.deal.create({
			data: {
				...dealData,
				items: {
					create: items.map(item => ({
						productId: item.productId,
						itemType: item.itemType,
						quantity: item.quantity,
					})),
				},
			},
			include: {
				items: {
					include: {
						product: true,
					},
				},
			},
		})

		return res.status(201).json({
			success: true,
			message: 'Deal created successfully',
			data: deal,
		})
	} catch (error) {
		console.error('Error creating deal:', error)
		return res.status(500).json({ success: false, message: 'Server error' })
	}
}

export const updateDeal = async (req: Request, res: Response) => {
	try {
		const id = getParamString((req.params as any).id)
		if (!id) {
			return res.status(400).json({ success: false, message: 'Invalid id' })
		}
		const validation = updateDealSchema.safeParse(req.body)
		if (!validation.success) {
			return res.status(400).json({
				success: false,
				message: 'Validation error',
				errors: validation.error.format(),
			})
		}

		const existing = await prisma.deal.findUnique({ where: { id } })
		if (!existing) {
			return res.status(404).json({ success: false, message: 'Deal not found' })
		}

		const { items, ...dealData } = validation.data

		if (items && items.length > 0) {
			await prisma.dealItem.deleteMany({ where: { dealId: id } })
		}

		const deal = await prisma.deal.update({
			where: { id },
			data: {
				...dealData,
				...(items && items.length > 0
					? {
						items: {
							create: items.map(item => ({
								productId: item.productId,
								itemType: item.itemType,
								quantity: item.quantity,
							})),
						},
					}
					: {}),
			},
			include: {
				items: {
					include: { product: true },
				},
			},
		})

		return res.status(200).json({
			success: true,
			message: 'Deal updated successfully',
			data: deal,
		})
	} catch (error) {
		console.error('Error updating deal:', error)
		return res.status(500).json({ success: false, message: 'Server error' })
	}
}

export const deleteDeal = async (req: Request, res: Response) => {
	try {
		const id = getParamString((req.params as any).id)
		if (!id) {
			return res.status(400).json({ success: false, message: 'Invalid id' })
		}
		const existing = await prisma.deal.findUnique({ where: { id } })
		if (!existing) {
			return res.status(404).json({ success: false, message: 'Deal not found' })
		}

		await prisma.deal.delete({ where: { id } })

		return res.status(200).json({
			success: true,
			message: 'Deal deleted successfully',
		})
	} catch (error) {
		console.error('Error deleting deal:', error)
		return res.status(500).json({ success: false, message: 'Server error' })
	}
}
