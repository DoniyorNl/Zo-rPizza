// backend/src/controllers/products.controller.ts
// 🍕 PRODUCTS CONTROLLER

import { Request, Response } from 'express'
import { prisma } from '../server'

// GET /api/products - Barcha mahsulotlar
export const getAllProducts = async (req: Request, res: Response) => {
	try {
		const { categoryId, isActive } = req.query

		const products = await prisma.product.findMany({
			where: {
				...(categoryId && { categoryId: categoryId as string }),
				...(isActive !== undefined && { isActive: isActive === 'true' }),
			},
			include: {
				category: true,
				ingredients: {
					include: {
						ingredient: true,
					},
				},
			},
			orderBy: { createdAt: 'desc' },
		})

		res.status(200).json({
			success: true,
			count: products.length,
			data: products,
		})
	} catch (error) {
		console.error('Error fetching products:', error)
		res.status(500).json({
			success: false,
			message: 'Server error',
			error: error instanceof Error ? error.message : 'Unknown error',
		})
	}
}

// GET /api/products/:id - Bitta mahsulot
export const getProductById = async (req: Request, res: Response) => {
	try {
		const { id } = req.params

		const product = await prisma.product.findUnique({
			where: { id },
			include: {
				category: true,
				ingredients: {
					include: {
						ingredient: true,
					},
				},
				reviews: {
					include: {
						user: {
							select: { name: true, email: true },
						},
					},
				},
			},
		})

		if (!product) {
			return res.status(404).json({
				success: false,
				message: 'Product not found',
			})
		}

		res.status(200).json({
			success: true,
			data: product,
		})
	} catch (error) {
		console.error('Error fetching product:', error)
		return res.status(500).json({
			success: false,
			message: 'Server error',
			error: error instanceof Error ? error.message : 'Unknown error',
		})
	}
}

// POST /api/products - Yangi mahsulot
export const createProduct = async (req: Request, res: Response) => {
	try {
		const { name, description, price, imageUrl, prepTime, categoryId } = req.body

		// Validation
		if (!name || !price || !categoryId) {
			return res.status(400).json({
				success: false,
				message: 'Name, price, and categoryId are required',
			})
		}

		// Category mavjudligini tekshirish
		const category = await prisma.category.findUnique({
			where: { id: categoryId },
		})

		if (!category) {
			return res.status(404).json({
				success: false,
				message: 'Category not found',
			})
		}

		const product = await prisma.product.create({
			data: {
				name,
				description,
				price: parseFloat(price),
				imageUrl,
				prepTime: parseInt(prepTime) || 15,
				categoryId,
			},
			include: {
				category: true,
			},
		})

		res.status(201).json({
			success: true,
			message: 'Product created successfully',
			data: product,
		})
	} catch (error) {
		console.error('Error creating product:', error)
		return res.status(500).json({
			success: false,
			message: 'Server error',
			error: error instanceof Error ? error.message : 'Unknown error',
		})
	}
}

// PUT /api/products/:id - Mahsulot yangilash
export const updateProduct = async (req: Request, res: Response) => {
	try {
		const { id } = req.params
		const { name, description, price, imageUrl, prepTime, categoryId, isActive } = req.body

		// Mahsulot mavjudligini tekshirish
		const existing = await prisma.product.findUnique({
			where: { id },
		})

		if (!existing) {
			return res.status(404).json({
				success: false,
				message: 'Product not found',
			})
		}

		// Agar categoryId o'zgartirilayotgan bo'lsa, category borligini tekshir
		if (categoryId && categoryId !== existing.categoryId) {
			const category = await prisma.category.findUnique({
				where: { id: categoryId },
			})

			if (!category) {
				return res.status(404).json({
					success: false,
					message: 'Category not found',
				})
			}
		}

		const product = await prisma.product.update({
			where: { id },
			data: {
				...(name && { name }),
				...(description && { description }),
				...(price && { price: parseFloat(price) }),
				...(imageUrl && { imageUrl }),
				...(prepTime && { prepTime: parseInt(prepTime) }),
				...(categoryId && { categoryId }),
				...(isActive !== undefined && { isActive }),
			},
			include: {
				category: true,
			},
		})

		res.status(200).json({
			success: true,
			message: 'Product updated successfully',
			data: product,
		})
	} catch (error) {
		console.error('Error updating product:', error)
		return res.status(500).json({
			success: false,
			message: 'Server error',
			error: error instanceof Error ? error.message : 'Unknown error',
		})
	}
}

// DELETE /api/products/:id - Mahsulot o'chirish
export const deleteProduct = async (req: Request, res: Response) => {
	try {
		const { id } = req.params

		// Mahsulot mavjudligini tekshirish
		const existing = await prisma.product.findUnique({
			where: { id },
			include: {
				orderItems: true,
			},
		})

		if (!existing) {
			return res.status(404).json({
				success: false,
				message: 'Product not found',
			})
		}

		// Buyurtmalarda ishlatilganmi? Soft delete
		if (existing.orderItems.length > 0) {
			await prisma.product.update({
				where: { id },
				data: { isActive: false },
			})

			return res.status(200).json({
				success: true,
				message: 'Product deactivated (used in orders)',
			})
		}

		// Ishlatilmagan - to'liq o'chirish
		await prisma.product.delete({
			where: { id },
		})

		res.status(200).json({
			success: true,
			message: 'Product deleted successfully',
		})
	} catch (error) {
		console.error('Error deleting product:', error)
		return res.status(500).json({
			success: false,
			message: 'Server error',
			error: error instanceof Error ? error.message : 'Unknown error',
		})
	}
}
