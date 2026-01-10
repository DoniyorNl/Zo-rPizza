// backend/src/controllers/categories.controller.ts
// 🍕 CATEGORIES CONTROLLER

import { Request, Response } from 'express'
import { prisma } from '../server'

// GET /api/categories - Barcha kategoriyalar
export const getAllCategories = async (_req: Request, res: Response) => {
	try {
		const categories = await prisma.category.findMany({
			where: { isActive: true },
			include: {
				_count: {
					select: { products: true }, // Har bir kategoriyada nechta mahsulot bor
				},
			},
			orderBy: { name: 'asc' },
		})

		res.status(200).json({
			success: true,
			count: categories.length,
			data: categories,
		})
	} catch (error) {
		console.error('Error fetching categories:', error)
		res.status(500).json({
			success: false,
			message: 'Server error',
			error: error instanceof Error ? error.message : 'Unknown error',
		})
	}
}

// GET /api/categories/:id - Bitta kategoriya
export const getCategoryById = async (req: Request, res: Response) => {
	try {
		const { id } = req.params

		const category = await prisma.category.findUnique({
			where: { id },
			include: {
				products: {
					where: { isActive: true },
				},
			},
		})

		if (!category) {
			return res.status(404).json({
				success: false,
				message: 'Category not found',
			})
		}

		res.status(200).json({
			success: true,
			data: category,
		})
	} catch (error) {
		console.error('Error fetching category:', error)
		return res.status(500).json({
			success: false,
			message: 'Server error',
			error: error instanceof Error ? error.message : 'Unknown error',
		})
	}
}

// POST /api/categories - Yangi kategoriya
export const createCategory = async (req: Request, res: Response) => {
	try {
		const { name, description, imageUrl } = req.body

		// Validation
		if (!name) {
			return res.status(400).json({
				success: false,
				message: 'Name is required',
			})
		}

		// Bir xil nom bilan kategoriya bormi?
		const existing = await prisma.category.findUnique({
			where: { name },
		})

		if (existing) {
			return res.status(400).json({
				success: false,
				message: 'Category already exists',
			})
		}

		const category = await prisma.category.create({
			data: {
				name,
				description,
				imageUrl,
			},
		})

		res.status(201).json({
			success: true,
			message: 'Category created successfully',
			data: category,
		})
	} catch (error) {
		console.error('Error creating category:', error)
		return res.status(500).json({
			success: false,
			message: 'Server error',
			error: error instanceof Error ? error.message : 'Unknown error',
		})
	}
}

// PUT /api/categories/:id - Kategoriya yangilash
export const updateCategory = async (req: Request, res: Response) => {
	try {
		const { id } = req.params
		const { name, description, imageUrl, isActive } = req.body

		// Kategoriya bormi?
		const existing = await prisma.category.findUnique({
			where: { id },
		})

		if (!existing) {
			return res.status(404).json({
				success: false,
				message: 'Category not found',
			})
		}

		const category = await prisma.category.update({
			where: { id },
			data: {
				name,
				description,
				imageUrl,
				isActive,
			},
		})

		res.status(200).json({
			success: true,
			message: 'Category updated successfully',
			data: category,
		})
	} catch (error) {
		console.error('Error updating category:', error)
		return res.status(500).json({
			success: false,
			message: 'Server error',
			error: error instanceof Error ? error.message : 'Unknown error',
		})
	}
}

// DELETE /api/categories/:id - Kategoriya o'chirish
export const deleteCategory = async (req: Request, res: Response) => {
	try {
		const { id } = req.params

		// Kategoriya bormi?
		const existing = await prisma.category.findUnique({
			where: { id },
			include: {
				_count: {
					select: { products: true },
				},
			},
		})

		if (!existing) {
			return res.status(404).json({
				success: false,
				message: 'Category not found',
			})
		}

		// Mahsulot bormi? Soft delete qilamiz
		if (existing._count.products > 0) {
			await prisma.category.update({
				where: { id },
				data: { isActive: false },
			})

			return res.status(200).json({
				success: true,
				message: 'Category deactivated (has products)',
			})
		}

		// Mahsulot yo'q - to'liq o'chiramiz
		await prisma.category.delete({
			where: { id },
		})

		res.status(200).json({
			success: true,
			message: 'Category deleted successfully',
		})
	} catch (error) {
		console.error('Error deleting category:', error)
		return res.status(500).json({
			success: false,
			message: 'Server error',
			error: error instanceof Error ? error.message : 'Unknown error',
		})
	}
}
