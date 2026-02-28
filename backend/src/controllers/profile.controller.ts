// =====================================
// 📁 FILE PATH: backend/src/controllers/profile.controller.ts
// 🎯 PURPOSE: User Profile Management with Statistics
// =====================================

import { Request, Response } from 'express'
import prisma from '../lib/prisma'

// ==========================================
// GET SIMPLE PROFILE
// ==========================================

/**
 * GET /api/profile - Foydalanuvchi profilini olish (favorites uchun)
 */
export const getProfile = async (req: Request, res: Response) => {
	const startTime = Date.now()

	try {
		const firebaseUid = (req as any).userId

		if (!firebaseUid) {
			return res.status(401).json({
				success: false,
				message: 'Authentication required',
			})
		}

		// Find user by firebaseUid
		const user = await prisma.user.findUnique({
			where: { firebaseUid },
			select: {
				id: true,
				email: true,
				name: true,
				phone: true,
				avatar: true,
				loyaltyPoints: true,
				totalSpent: true,
				favoriteProducts: true,
				emailNotificationsEnabled: true,
			},
		})

		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
			})
		}

		const duration = Date.now() - startTime
		console.log(`[GET_PROFILE] ✓ Profile fetched: ${user.email} | ${duration}ms`)

		return res.status(200).json({
			success: true,
			data: user,
		})
	} catch (error) {
		const duration = Date.now() - startTime
		console.error(`[GET_PROFILE] Error:`, {
			error: error instanceof Error ? error.message : 'Unknown error',
			duration: `${duration}ms`,
		})

		return res.status(500).json({
			success: false,
			message: 'Server error while fetching profile',
		})
	}
}

// ==========================================
// GET PROFILE WITH STATISTICS
// ==========================================

/**
 * GET /api/profile/stats - Foydalanuvchi profili va statistikasi
 */
export const getProfileStats = async (req: Request, res: Response) => {
	const startTime = Date.now()

	try {
		const firebaseUid = (req as any).userId

		if (!firebaseUid) {
			return res.status(401).json({
				success: false,
				message: 'Authentication required',
			})
		}

		// Find user by firebaseUid
		const user = await prisma.user.findUnique({
			where: { firebaseUid },
			select: {
				id: true,
				email: true,
				name: true,
				phone: true,
				avatar: true,
				dateOfBirth: true,
				gender: true,
				loyaltyPoints: true,
				totalSpent: true,
				memberSince: true,
				createdAt: true,
				dietaryPrefs: true,
				allergyInfo: true,
				favoriteProducts: true,
				emailNotificationsEnabled: true,
			},
		})

		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
			})
		}

		const userId = user.id

		// Parallel queries for better performance
		const [orderStats, recentOrders, favoriteProducts] = await Promise.all([
			// Order statistics
			prisma.order.aggregate({
				where: { userId },
				_count: { id: true },
				_sum: { totalPrice: true },
			}),

			// Recent orders (last 5)
			prisma.order.findMany({
				where: { userId },
				take: 5,
				orderBy: { createdAt: 'desc' },
				select: {
					id: true,
					orderNumber: true,
					status: true,
					totalPrice: true,
					createdAt: true,
					items: {
						select: {
							quantity: true,
							product: {
								select: {
									name: true,
									imageUrl: true,
								},
							},
						},
					},
				},
			}),

			// Most ordered products
			prisma.orderItem.groupBy({
				by: ['productId'],
				where: {
					order: { userId },
					productId: { not: null },
				},
				_count: { productId: true },
				_sum: { quantity: true },
				orderBy: { _count: { productId: 'desc' } },
				take: 5,
			}),
		])

		// Get product details for favorite products
		const favoriteProductDetails = await prisma.product.findMany({
			where: {
				id: {
					in: favoriteProducts.map(fp => fp.productId).filter((id): id is string => id !== null),
				},
			},
			select: {
				id: true,
				name: true,
				imageUrl: true,
				basePrice: true,
			},
		})

		// Calculate statistics
		const totalOrders = orderStats._count.id
		const totalSpent = orderStats._sum.totalPrice || 0

		// Order status breakdown
		const statusBreakdown = await prisma.order.groupBy({
			by: ['status'],
			where: { userId },
			_count: { status: true },
		})

		// Calculate average order value
		const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0

		// Calculate loyalty tier
		const loyaltyTier = calculateLoyaltyTier(user.loyaltyPoints)

		const duration = Date.now() - startTime
		console.log(`[GET_PROFILE_STATS] ✓ Profile stats fetched: ${user.email} | ${duration}ms`)

		return res.status(200).json({
			success: true,
			data: {
				user: {
					...user,
					loyaltyTier,
				},
				statistics: {
					totalOrders,
					totalSpent,
					avgOrderValue,
					loyaltyPoints: user.loyaltyPoints,
					memberSince: user.memberSince,
					statusBreakdown: statusBreakdown.map(s => ({
						status: s.status,
						count: s._count.status,
					})),
				},
				recentOrders,
				favoriteProducts: favoriteProductDetails.map(product => {
					const orderCount = favoriteProducts.find(fp => fp.productId === product.id)
					return {
						...product,
						orderCount: orderCount?._sum.quantity || 0,
					}
				}),
			},
		})
	} catch (error) {
		const duration = Date.now() - startTime
		console.error(`[GET_PROFILE_STATS] Error:`, {
			error: error instanceof Error ? error.message : 'Unknown error',
			duration: `${duration}ms`,
		})

		return res.status(500).json({
			success: false,
			message: 'Server error while fetching profile statistics',
		})
	}
}

// ==========================================
// UPDATE PROFILE
// ==========================================

/**
 * PATCH /api/profile - Profil ma'lumotlarini yangilash (favorites uchun ham)
 */
export const patchProfile = async (req: Request, res: Response) => {
	const startTime = Date.now()

	try {
		const firebaseUid = (req as any).userId
		const { name, phone, avatar, dateOfBirth, gender, dietaryPrefs, allergyInfo, favoriteProducts, emailNotificationsEnabled } = req.body

		if (!firebaseUid) {
			return res.status(401).json({
				success: false,
				message: 'Authentication required',
			})
		}

		// Validate phone format if provided
		if (phone && !isValidPhone(phone)) {
			return res.status(400).json({
				success: false,
				message: 'Invalid phone format. Use international format: +998901234567, +31684702089, etc.',
			})
		}

		// Update user profile
		const user = await prisma.user.update({
			where: { firebaseUid },
			data: {
				...(name !== undefined && { name: name.trim() }),
				...(phone !== undefined && { phone: phone.replace(/\s/g, '') }),
				...(avatar !== undefined && { avatar }),
				...(dateOfBirth !== undefined && { dateOfBirth: new Date(dateOfBirth) }),
				...(gender !== undefined && { gender }),
				...(dietaryPrefs !== undefined && { dietaryPrefs }),
				...(allergyInfo !== undefined && { allergyInfo }),
				...(favoriteProducts !== undefined && { favoriteProducts }),
				...(emailNotificationsEnabled !== undefined && { emailNotificationsEnabled: Boolean(emailNotificationsEnabled) }),
			},
			select: {
				id: true,
				email: true,
				name: true,
				phone: true,
				avatar: true,
				dateOfBirth: true,
				gender: true,
				dietaryPrefs: true,
				allergyInfo: true,
				loyaltyPoints: true,
				totalSpent: true,
				favoriteProducts: true,
				emailNotificationsEnabled: true,
			},
		})

		const duration = Date.now() - startTime
		console.log(`[PATCH_PROFILE] ✓ Profile updated: ${user.email} | ${duration}ms`)

		return res.status(200).json({
			success: true,
			message: 'Profile updated successfully',
			data: user,
		})
	} catch (error) {
		const duration = Date.now() - startTime
		console.error(`[PATCH_PROFILE] Error:`, {
			error: error instanceof Error ? error.message : 'Unknown error',
			duration: `${duration}ms`,
		})

		return res.status(500).json({
			success: false,
			message: 'Server error while updating profile',
		})
	}
}

/**
 * PUT /api/profile - Profil ma'lumotlarini yangilash
 */
export const updateProfile = async (req: Request, res: Response) => {
	const startTime = Date.now()

	try {
		const firebaseUid = (req as any).userId
		const { name, phone, avatar, dateOfBirth, gender, dietaryPrefs, allergyInfo, emailNotificationsEnabled } = req.body

		if (!firebaseUid) {
			return res.status(401).json({
				success: false,
				message: 'Authentication required',
			})
		}

		// Validate phone format if provided
		if (phone && !isValidPhone(phone)) {
			return res.status(400).json({
				success: false,
				message: 'Invalid phone format. Use international format: +998901234567, +31684702089, etc.',
			})
		}

		// Update user profile
		const user = await prisma.user.update({
			where: { firebaseUid },
			data: {
				...(name !== undefined && { name: name.trim() }),
				...(phone !== undefined && { phone: phone.replace(/\s/g, '') }),
				...(avatar !== undefined && { avatar }),
				...(dateOfBirth !== undefined && { dateOfBirth: new Date(dateOfBirth) }),
				...(gender !== undefined && { gender }),
				...(dietaryPrefs !== undefined && { dietaryPrefs }),
				...(allergyInfo !== undefined && { allergyInfo }),
				...(emailNotificationsEnabled !== undefined && { emailNotificationsEnabled: Boolean(emailNotificationsEnabled) }),
			},
			select: {
				id: true,
				email: true,
				name: true,
				phone: true,
				avatar: true,
				dateOfBirth: true,
				gender: true,
				dietaryPrefs: true,
				allergyInfo: true,
				loyaltyPoints: true,
				totalSpent: true,
				emailNotificationsEnabled: true,
			},
		})

		const duration = Date.now() - startTime
		console.log(`[UPDATE_PROFILE] ✓ Profile updated: ${user.email} | ${duration}ms`)

		return res.status(200).json({
			success: true,
			message: 'Profile updated successfully',
			data: user,
		})
	} catch (error) {
		const duration = Date.now() - startTime
		console.error(`[UPDATE_PROFILE] Error:`, {
			error: error instanceof Error ? error.message : 'Unknown error',
			duration: `${duration}ms`,
		})

		return res.status(500).json({
			success: false,
			message: 'Server error while updating profile',
		})
	}
}

// ==========================================
// ADDRESS MANAGEMENT
// ==========================================

/**
 * GET /api/profile/addresses - Barcha manzillarni olish
 */
export const getAddresses = async (req: Request, res: Response) => {
	const startTime = Date.now()

	try {
		const firebaseUid = (req as any).userId

		if (!firebaseUid) {
			return res.status(401).json({
				success: false,
				message: 'Authentication required',
			})
		}

		// Find user by firebaseUid
		const user = await prisma.user.findUnique({
			where: { firebaseUid },
			select: { id: true },
		})

		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
			})
		}

		const addresses = await prisma.address.findMany({
			where: { userId: user.id },
			orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
		})

		const duration = Date.now() - startTime
		console.log(`[GET_ADDRESSES] ✓ Addresses fetched: ${addresses.length} | ${duration}ms`)

		return res.status(200).json({
			success: true,
			data: addresses,
		})
	} catch (error) {
		const duration = Date.now() - startTime
		console.error(`[GET_ADDRESSES] Error:`, {
			error: error instanceof Error ? error.message : 'Unknown error',
			duration: `${duration}ms`,
		})

		return res.status(500).json({
			success: false,
			message: 'Server error while fetching addresses',
		})
	}
}

/**
 * POST /api/profile/addresses - Yangi manzil qo'shish
 */
export const createAddress = async (req: Request, res: Response) => {
	const startTime = Date.now()

	try {
		const firebaseUid = (req as any).userId
		const { label, street, building, apartment, floor, entrance, landmark, lat, lng, isDefault } =
			req.body

		if (!firebaseUid) {
			return res.status(401).json({
				success: false,
				message: 'Authentication required',
			})
		}

		// Find user by firebaseUid
		const user = await prisma.user.findUnique({
			where: { firebaseUid },
			select: { id: true },
		})

		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
			})
		}

		// Validation
		if (!label || !street) {
			return res.status(400).json({
				success: false,
				message: 'Label and street are required',
			})
		}

		// If this is set as default, unset other defaults
		if (isDefault) {
			await prisma.address.updateMany({
				where: { userId: user.id, isDefault: true },
				data: { isDefault: false },
			})
		}

		const address = await prisma.address.create({
			data: {
				userId: user.id,
				label,
				street,
				building,
				apartment,
				floor,
				entrance,
				landmark,
				lat,
				lng,
				isDefault: isDefault || false,
			},
		})

		const duration = Date.now() - startTime
		console.log(`[CREATE_ADDRESS] ✓ Address created: ${label} | ${duration}ms`)

		return res.status(201).json({
			success: true,
			message: 'Address created successfully',
			data: address,
		})
	} catch (error) {
		const duration = Date.now() - startTime
		console.error(`[CREATE_ADDRESS] Error:`, {
			error: error instanceof Error ? error.message : 'Unknown error',
			duration: `${duration}ms`,
		})

		return res.status(500).json({
			success: false,
			message: 'Server error while creating address',
		})
	}
}

/**
 * PUT /api/profile/addresses/:id - Manzilni yangilash
 */
export const updateAddress = async (req: Request, res: Response) => {
	const startTime = Date.now()

	try {
		const firebaseUid = (req as any).userId
		const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
		const { label, street, building, apartment, floor, entrance, landmark, lat, lng, isDefault } =
			req.body

		if (!firebaseUid) {
			return res.status(401).json({
				success: false,
				message: 'Authentication required',
			})
		}

		// Find user by firebaseUid
		const user = await prisma.user.findUnique({
			where: { firebaseUid },
			select: { id: true },
		})

		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
			})
		}

		// Check if address belongs to user
		const existingAddress = await prisma.address.findFirst({
			where: { id: idParam, userId: user.id },
		})

		if (!existingAddress) {
			return res.status(404).json({
				success: false,
				message: 'Address not found',
			})
		}

		// If setting as default, unset other defaults
		if (isDefault) {
			await prisma.address.updateMany({
				where: { userId: user.id, isDefault: true, id: { not: idParam } },
				data: { isDefault: false },
			})
		}

		const address = await prisma.address.update({
			where: { id: idParam },
			data: {
				...(label !== undefined && { label }),
				...(street !== undefined && { street }),
				...(building !== undefined && { building }),
				...(apartment !== undefined && { apartment }),
				...(floor !== undefined && { floor }),
				...(entrance !== undefined && { entrance }),
				...(landmark !== undefined && { landmark }),
				...(lat !== undefined && { lat }),
				...(lng !== undefined && { lng }),
				...(isDefault !== undefined && { isDefault }),
			},
		})

		const duration = Date.now() - startTime
		console.log(`[UPDATE_ADDRESS] ✓ Address updated: ${idParam} | ${duration}ms`)

		return res.status(200).json({
			success: true,
			message: 'Address updated successfully',
			data: address,
		})
	} catch (error) {
		const duration = Date.now() - startTime
		console.error(`[UPDATE_ADDRESS] Error:`, {
			error: error instanceof Error ? error.message : 'Unknown error',
			duration: `${duration}ms`,
		})

		return res.status(500).json({
			success: false,
			message: 'Server error while updating address',
		})
	}
}

/**
 * DELETE /api/profile/addresses/:id - Manzilni o'chirish
 */
export const deleteAddress = async (req: Request, res: Response) => {
	const startTime = Date.now()

	try {
		const firebaseUid = (req as any).userId
		const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id

		if (!firebaseUid) {
			return res.status(401).json({
				success: false,
				message: 'Authentication required',
			})
		}

		// Find user by firebaseUid
		const user = await prisma.user.findUnique({
			where: { firebaseUid },
			select: { id: true },
		})

		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
			})
		}

		// Check if address belongs to user
		const existingAddress = await prisma.address.findFirst({
			where: { id: idParam, userId: user.id },
		})

		if (!existingAddress) {
			return res.status(404).json({
				success: false,
				message: 'Address not found',
			})
		}

		await prisma.address.delete({
			where: { id: idParam },
		})

		const duration = Date.now() - startTime
		console.log(`[DELETE_ADDRESS] ✓ Address deleted: ${idParam} | ${duration}ms`)

		return res.status(200).json({
			success: true,
			message: 'Address deleted successfully',
		})
	} catch (error) {
		const duration = Date.now() - startTime
		console.error(`[DELETE_ADDRESS] Error:`, {
			error: error instanceof Error ? error.message : 'Unknown error',
			duration: `${duration}ms`,
		})

		return res.status(500).json({
			success: false,
			message: 'Server error while deleting address',
		})
	}
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Validate phone format (International format)
 * Supports: +998, +31, +1, +7, etc.
 */
const isValidPhone = (phone: string): boolean => {
	// Remove all spaces, dashes, brackets
	const cleanPhone = phone.replace(/[\s\-\(\)]/g, '')
	
	// Must start with + and have at least 10 digits total
	// Example: +998901234567 (13 chars), +31684702089 (12 chars), +1234567890 (11 chars)
	const phoneRegex = /^\+[1-9][0-9]{9,14}$/
	
	return phoneRegex.test(cleanPhone)
}

/**
 * Calculate loyalty tier based on points
 */
const calculateLoyaltyTier = (points: number): string => {
	if (points >= 1000) return 'PLATINUM'
	if (points >= 500) return 'GOLD'
	if (points >= 200) return 'SILVER'
	return 'BRONZE'
}
