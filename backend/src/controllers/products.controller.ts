// backend/src/controllers/products.controller.ts
// 🍕 PRODUCTS CONTROLLER - Updated with Variations

import { Request, Response } from 'express'
import prisma from '../lib/prisma'

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
				variations: {
					orderBy: { price: 'asc' },
				},
				ingredientsRel: {
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
		const productId = Array.isArray(id) ? id[0] : id

		const product = await prisma.product.findUnique({
			where: { id: productId },
			include: {
				category: true,
				variations: {
					orderBy: { price: 'asc' },
				},
				ingredientsRel: {
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

		// JSON maydonlarni to'g'ri formatlash
		let ingredients = null
		if (product.ingredients) {
			try {
				ingredients =
					typeof product.ingredients === 'string'
						? JSON.parse(product.ingredients)
						: product.ingredients
			} catch (e) {
				console.error('Error parsing ingredients:', e)
				ingredients = null
			}
		}

		let cookingSteps = null
		if (product.cookingSteps) {
			try {
				cookingSteps =
					typeof product.cookingSteps === 'string'
						? JSON.parse(product.cookingSteps)
						: product.cookingSteps
			} catch (e) {
				console.error('Error parsing cookingSteps:', e)
				cookingSteps = null
			}
		}

		// Ma'lumotlarni to'g'ri formatda qaytarish
		const formattedProduct = {
			...product,
			ingredients: ingredients,
			cookingSteps: cookingSteps,
			images: product.images || [],
			allergens: product.allergens || [],
		}

		return res.status(200).json({
			success: true,
			data: formattedProduct,
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

// POST /api/products - Yangi mahsulot (with variations)
export const createProduct = async (req: Request, res: Response) => {
	try {
		const {
			name,
			description,
			basePrice,
			imageUrl,
			prepTime,
			categoryId,
			variations, // NEW: Array of sizes
			ingredients,
			recipe,
			cookingTemp,
			cookingTime,
			cookingSteps,
			calories,
			protein,
			carbs,
			fat,
			difficulty,
			servings,
			allergens,
			images,
			isActive,
		} = req.body

		// Validation
		if (!name || !basePrice || !categoryId) {
			return res.status(400).json({
				success: false,
				message: 'Name, basePrice, and categoryId are required',
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

		// JSON maydonlarni to'g'ri formatlash
		let formattedIngredients = null
		if (ingredients) {
			formattedIngredients = typeof ingredients === 'string' ? JSON.parse(ingredients) : ingredients
		}

		let formattedCookingSteps = null
		if (cookingSteps) {
			formattedCookingSteps =
				typeof cookingSteps === 'string' ? JSON.parse(cookingSteps) : cookingSteps
		}

		const product = await prisma.product.create({
			data: {
				name,
				description,
				basePrice: parseFloat(basePrice),
				imageUrl,
				prepTime: parseInt(prepTime) || 15,
				categoryId,
				ingredients: formattedIngredients,
				recipe,
				cookingTemp: cookingTemp ? parseInt(cookingTemp) : null,
				cookingTime: cookingTime ? parseInt(cookingTime) : null,
				cookingSteps: formattedCookingSteps,
				calories: calories ? parseInt(calories) : null,
				protein: protein ? parseFloat(protein) : null,
				carbs: carbs ? parseFloat(carbs) : null,
				fat: fat ? parseFloat(fat) : null,
				difficulty,
				servings: servings ? parseInt(servings) : null,
				allergens: allergens || [],
				images: images || [],
				isActive: isActive !== undefined ? isActive : true,
				// NEW: Create variations
				...(variations && variations.length > 0 && {
					variations: {
						create: variations.map((v: any) => ({
							size: v.size,
							price: parseFloat(v.price),
							diameter: v.diameter ? parseInt(v.diameter) : null,
							slices: v.slices ? parseInt(v.slices) : null,
							weight: v.weight ? parseInt(v.weight) : null,
						})),
					},
				}),
			},
			include: {
				category: true,
				variations: true,
			},
		})

		return res.status(201).json({
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

// PUT /api/products/:id - Mahsulot yangilash (with variations)
export const updateProduct = async (req: Request, res: Response) => {
	try {
		const { id } = req.params
		const productId = Array.isArray(id) ? id[0] : id
		const {
			name,
			description,
			basePrice,
			imageUrl,
			prepTime,
			categoryId,
			variations,
			isActive,
		} = req.body

		// Mahsulot mavjudligini tekshirish
		const existing = await prisma.product.findUnique({
			where: { id: productId },
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

		// If variations provided, delete old and create new
		if (variations && Array.isArray(variations)) {
			await prisma.productVariation.deleteMany({
				where: { productId },
			})
		}

		const product = await prisma.product.update({
			where: { id: productId },
			data: {
				...(name && { name }),
				...(description && { description }),
				...(basePrice && { basePrice: parseFloat(basePrice) }),
				...(imageUrl && { imageUrl }),
				...(prepTime && { prepTime: parseInt(prepTime) }),
				...(categoryId && { categoryId }),
				...(isActive !== undefined && { isActive }),
				// Update variations if provided
				...(variations && variations.length > 0 && {
					variations: {
						create: variations.map((v: any) => ({
							size: v.size,
							price: parseFloat(v.price),
							diameter: v.diameter ? parseInt(v.diameter) : null,
							slices: v.slices ? parseInt(v.slices) : null,
							weight: v.weight ? parseInt(v.weight) : null,
						})),
					},
				}),
			},
			include: {
				category: true,
				variations: true,
			},
		})

		return res.status(200).json({
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

// DELETE /api/products/:id - Mahsulotni yashirish (Soft Delete)
export const deleteProduct = async (req: Request, res: Response) => {
	try {
		const { id } = req.params
		const productId = Array.isArray(id) ? id[0] : id

		// Mahsulot mavjudligini tekshirish
		const existing = await prisma.product.findUnique({
			where: { id: productId },
		})

		if (!existing) {
			return res.status(404).json({
				success: false,
				message: 'Product not found',
			})
		}

		// Soft delete: faqat isActive ni false qilish
		const product = await prisma.product.update({
			where: { id: productId },
			data: {
				isActive: false,
				updatedAt: new Date(),
			},
		})

		return res.status(200).json({
			success: true,
			message: 'Product deactivated successfully (hidden from menu)',
			data: product,
		})
	} catch (error) {
		console.error('Error deactivating product:', error)
		return res.status(500).json({
			success: false,
			message: 'Server error',
			error: error instanceof Error ? error.message : 'Unknown error',
		})
	}
}

// PATCH /api/products/:id/restore - Mahsulotni qayta faollashtirish
export const restoreProduct = async (req: Request, res: Response) => {
	try {
		const { id } = req.params
		const productId = Array.isArray(id) ? id[0] : id

		// Mahsulot mavjudligini tekshirish
		const existing = await prisma.product.findUnique({
			where: { id: productId },
		})

		if (!existing) {
			return res.status(404).json({
				success: false,
				message: 'Product not found',
			})
		}

		if (existing.isActive) {
			return res.status(400).json({
				success: false,
				message: 'Product is already active',
			})
		}

		// Mahsulotni qayta faollashtirish
		const product = await prisma.product.update({
			where: { id: productId },
			data: {
				isActive: true,
				updatedAt: new Date(),
			},
		})

		return res.status(200).json({
			success: true,
			message: 'Product restored successfully',
			data: product,
		})
	} catch (error) {
		console.error('Error restoring product:', error)
		return res.status(500).json({
			success: false,
			message: 'Server error',
			error: error instanceof Error ? error.message : 'Unknown error',
		})
	}
}