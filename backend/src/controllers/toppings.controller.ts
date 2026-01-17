// backend/src/controllers/toppings.controller.ts
// 🍕 TOPPINGS CONTROLLER

import { Request, Response } from 'express'
import prisma from '../lib/prisma'
import { createToppingSchema, updateToppingSchema } from '../validators/topping.validator'

const getParamString = (value: unknown): string | undefined => {
	if (typeof value === 'string') return value
	if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
	return undefined
}

export const getAllToppings = async (_req: Request, res: Response) => {
	try {
		const toppings = await prisma.topping.findMany({
			orderBy: { createdAt: 'desc' },
		})
		return res.status(200).json({ success: true, data: toppings })
	} catch (error) {
		console.error('Error fetching toppings:', error)
		return res.status(500).json({ success: false, message: 'Server error' })
	}
}

export const createTopping = async (req: Request, res: Response) => {
	try {
		const validation = createToppingSchema.safeParse(req.body)
		if (!validation.success) {
			return res.status(400).json({
				success: false,
				message: 'Validation error',
				errors: validation.error.format(),
			})
		}

		const topping = await prisma.topping.create({ data: validation.data })
		return res.status(201).json({
			success: true,
			message: 'Topping created successfully',
			data: topping,
		})
	} catch (error) {
		console.error('Error creating topping:', error)
		return res.status(500).json({ success: false, message: 'Server error' })
	}
}

export const updateTopping = async (req: Request, res: Response) => {
	try {
		const id = getParamString((req.params as any).id)
		if (!id) {
			return res.status(400).json({ success: false, message: 'Invalid id' })
		}
		const validation = updateToppingSchema.safeParse(req.body)
		if (!validation.success) {
			return res.status(400).json({
				success: false,
				message: 'Validation error',
				errors: validation.error.format(),
			})
		}

		const existing = await prisma.topping.findUnique({ where: { id } })
		if (!existing) {
			return res.status(404).json({ success: false, message: 'Topping not found' })
		}

		const topping = await prisma.topping.update({
			where: { id },
			data: validation.data,
		})
		return res.status(200).json({
			success: true,
			message: 'Topping updated successfully',
			data: topping,
		})
	} catch (error) {
		console.error('Error updating topping:', error)
		return res.status(500).json({ success: false, message: 'Server error' })
	}
}

export const deleteTopping = async (req: Request, res: Response) => {
	try {
		const id = getParamString((req.params as any).id)
		if (!id) {
			return res.status(400).json({ success: false, message: 'Invalid id' })
		}

		const existing = await prisma.topping.findUnique({ where: { id } })
		if (!existing) {
			return res.status(404).json({ success: false, message: 'Topping not found' })
		}

		await prisma.topping.delete({ where: { id } })
		return res.status(200).json({ success: true, message: 'Topping deleted successfully' })
	} catch (error) {
		console.error('Error deleting topping:', error)
		return res.status(500).json({ success: false, message: 'Server error' })
	}
}
