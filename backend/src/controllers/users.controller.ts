// backend/src/controllers/users.controller.ts

import { Prisma, UserRole } from '@prisma/client'
import { Request, Response } from 'express'
import prisma from '../lib/prisma'
import { parseRole } from '../validators/role.validator'

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Sanitize user data - password ni olib tashlash
 */
const sanitizeUser = (user: any) => {
	const { password, ...sanitized } = user
	return sanitized
}

/**
 * Validate email format
 */
const isValidEmail = (email: string): boolean => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	return emailRegex.test(email)
}

/**
 * Validate phone format (O'zbekiston formati)
 */
const isValidPhone = (phone: string): boolean => {
	// +998901234567 yoki 901234567
	const phoneRegex = /^(\+998)?[0-9]{9}$/
	return phoneRegex.test(phone.replace(/\s/g, ''))
}

// ==========================================
// CREATE USER
// ==========================================

/**
 * POST /api/users - User yaratish (Firebase'dan keyin)
 */
export const createUser = async (req: Request, res: Response) => {
	const startTime = Date.now()

	try {
		const { firebaseUid, email, name, phone } = req.body

		// 1. Validation - Required fields
		if (!firebaseUid || !email) {
			return res.status(400).json({
				success: false,
				message: 'Firebase UID and email are required',
				errors: {
					firebaseUid: !firebaseUid ? 'Firebase UID is required' : undefined,
					email: !email ? 'Email is required' : undefined,
				},
			})
		}

		// 2. Validate email format
		if (!isValidEmail(email)) {
			return res.status(400).json({
				success: false,
				message: 'Invalid email format',
			})
		}

		// 3. Validate phone format (agar berilgan bo'lsa)
		if (phone && !isValidPhone(phone)) {
			return res.status(400).json({
				success: false,
				message: 'Invalid phone format. Use +998XXXXXXXXX or 9XXXXXXXX',
			})
		}

		// 4. Check if user already exists (Firebase UID bo'yicha)
		const existingUser = await prisma.user.findUnique({
			where: { id: firebaseUid },
		})

		if (existingUser) {
			const duration = Date.now() - startTime
			console.log(`[CREATE_USER] User already exists: ${email} | ${duration}ms`)

			return res.status(200).json({
				success: true,
				message: 'User already exists',
				data: sanitizeUser(existingUser),
			})
		}

		// 5. Check if email is already in use
		const existingEmail = await prisma.user.findUnique({
			where: { email },
		})

		if (existingEmail) {
			return res.status(400).json({
				success: false,
				message: 'Email already in use',
			})
		}

		// 6. Create new user
		const user = await prisma.user.create({
			data: {
				id: firebaseUid,
				email: email.toLowerCase().trim(), // Lowercase email
				name: name?.trim() || email.split('@')[0],
				phone: phone?.replace(/\s/g, '') || null, // Remove spaces
				password: 'FIREBASE_AUTH', // Firebase authentication
				role: 'CUSTOMER',
			},
		})

		const duration = Date.now() - startTime
		console.log(`[CREATE_USER] ✓ User created: ${email} | ${duration}ms`)

		return res.status(201).json({
			success: true,
			message: 'User created successfully',
			data: sanitizeUser(user),
		})
	} catch (error) {
		const duration = Date.now() - startTime
		console.error(`[CREATE_USER] Error:`, {
			error: error instanceof Error ? error.message : 'Unknown error',
			duration: `${duration}ms`,
		})

		// Handle specific Prisma errors
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			if (error.code === 'P2002') {
				return res.status(400).json({
					success: false,
					message: 'User with this email or ID already exists',
				})
			}
		}

		return res.status(500).json({
			success: false,
			message: 'Server error while creating user',
		})
	}
}

// ==========================================
// GET USER BY ID
// ==========================================

/**
 * GET /api/users/:id - User ma'lumotlarini olish
 */
export const getUserById = async (req: Request, res: Response) => {
	const startTime = Date.now()

	try {
		const { id } = req.params
		const userId = Array.isArray(id) ? id[0] : id

		// Validation
		if (!userId) {
			return res.status(400).json({
				success: false,
				message: 'User ID is required',
			})
		}

		// Fetch user with related data
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				email: true,
				name: true,
				phone: true,
				role: true,
				isBlocked: true,
				createdAt: true,
				updatedAt: true,
				_count: {
					select: {
						orders: true,
					},
				},
			},
		})

		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
			})
		}

		const duration = Date.now() - startTime
		console.log(`[GET_USER] ✓ User fetched: ${user.email} | ${duration}ms`)

		return res.status(200).json({
			success: true,
			data: user,
		})
	} catch (error) {
		const duration = Date.now() - startTime
		console.error(`[GET_USER] Error:`, {
			error: error instanceof Error ? error.message : 'Unknown error',
			duration: `${duration}ms`,
		})

		return res.status(500).json({
			success: false,
			message: 'Server error while fetching user',
		})
	}
}

// ==========================================
// UPDATE USER
// ==========================================

/**
 * PUT /api/users/:id - User ma'lumotlarini yangilash
 */
export const updateUser = async (req: Request, res: Response) => {
	const startTime = Date.now()

	try {
		const { id } = req.params
		const userId = Array.isArray(id) ? id[0] : id
		const { name, phone } = req.body

		// Validation
		if (!userId) {
			return res.status(400).json({
				success: false,
				message: 'User ID is required',
			})
		}

		// Validate phone format (agar berilgan bo'lsa)
		if (phone && !isValidPhone(phone)) {
			return res.status(400).json({
				success: false,
				message: 'Invalid phone format. Use +998XXXXXXXXX or 9XXXXXXXX',
			})
		}

		// Check if user exists
		const existingUser = await prisma.user.findUnique({
			where: { id: userId },
		})

		if (!existingUser) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
			})
		}

		// Check if user is blocked
		if (existingUser.isBlocked) {
			return res.status(403).json({
				success: false,
				message: 'Cannot update blocked user',
			})
		}

		// Update user
		const user = await prisma.user.update({
			where: { id: userId },
			data: {
				...(name && { name: name.trim() }),
				...(phone && { phone: phone.replace(/\s/g, '') }),
			},
			select: {
				id: true,
				email: true,
				name: true,
				phone: true,
				role: true,
				isBlocked: true,
				createdAt: true,
				updatedAt: true,
			},
		})

		const duration = Date.now() - startTime
		console.log(`[UPDATE_USER] ✓ User updated: ${user.email} | ${duration}ms`)

		return res.status(200).json({
			success: true,
			message: 'User updated successfully',
			data: user,
		})
	} catch (error) {
		const duration = Date.now() - startTime
		console.error(`[UPDATE_USER] Error:`, {
			error: error instanceof Error ? error.message : 'Unknown error',
			duration: `${duration}ms`,
		})

		return res.status(500).json({
			success: false,
			message: 'Server error while updating user',
		})
	}
}

// ==========================================
// GET ALL USERS (ADMIN ONLY)
// ==========================================

/**
 * GET /api/users - Barcha foydalanuvchilarni olish (Admin only)
 * Query params: page, limit, role, search
 */
export const getAllUsers = async (req: Request, res: Response) => {
	const startTime = Date.now()

	try {
		const { page = '1', limit = '10', role, search, isDriver } = req.query
		const skip = (parseInt(page as string) - 1) * parseInt(limit as string)

		// Build where clause
		const where: Prisma.UserWhereInput = {}

		// Role filter
		if (role && role !== 'ALL') {
			where.role = role as any
		}

		// Driver filter (haydovchilar ro'yxati)
		if (isDriver === 'true') {
			where.isDriver = true
		}

		// Search filter (name or email)
		if (search) {
			where.OR = [
				{ name: { contains: search as string, mode: 'insensitive' } },
				{ email: { contains: search as string, mode: 'insensitive' } },
			]
		}

		// Fetch users with pagination + statistics (barcha userlar bo'yicha)
		const [users, total, totalCustomers, totalAdmins, totalDelivery] = await Promise.all([
			prisma.user.findMany({
				where,
				skip,
				take: parseInt(limit as string),
				select: {
					id: true,
					name: true,
					email: true,
					phone: true,
					role: true,
					isDriver: true,
					vehicleType: true,
					isBlocked: true,
					createdAt: true,
					updatedAt: true,
					_count: {
						select: { orders: true },
					},
				},
				orderBy: { createdAt: 'desc' },
			}),
			prisma.user.count({ where }),
			prisma.user.count({ where: { role: 'CUSTOMER' } }),
			prisma.user.count({ where: { role: 'ADMIN' } }),
			prisma.user.count({ where: { isDriver: true } }),
		])

		const duration = Date.now() - startTime
		console.log(`[GET_ALL_USERS] ✓ Fetched ${users.length}/${total} users | ${duration}ms`)

		return res.status(200).json({
			success: true,
			data: {
				users,
				pagination: {
					total,
					page: parseInt(page as string),
					limit: parseInt(limit as string),
					totalPages: Math.ceil(total / parseInt(limit as string)),
				},
				statistics: {
					totalCustomers: totalCustomers ?? 0,
					totalAdmins: totalAdmins ?? 0,
					totalDelivery: totalDelivery ?? 0,
				},
			},
		})
	} catch (error) {
		const duration = Date.now() - startTime
		console.error(`[GET_ALL_USERS] Error:`, {
			error: error instanceof Error ? error.message : 'Unknown error',
			duration: `${duration}ms`,
		})

		return res.status(500).json({
			success: false,
			message: 'Server error while fetching users',
		})
	}
}

// ==========================================
// UPDATE USER ROLE (ADMIN ONLY)
// ==========================================

/**
 * PUT /api/users/:id/role - User rolini o'zgartirish (Admin only)
 */
export const updateUserRole = async (req: Request, res: Response) => {
	const startTime = Date.now()

	try {
		const { id } = req.params
		const userId = Array.isArray(id) ? id[0] : id

		if (!userId) {
			return res.status(400).json({
				success: false,
				message: 'User ID is required',
			})
		}

		const parsed = parseRole(req.body?.role)
		if (!parsed.success) {
			return res.status(400).json({
				success: false,
				message: parsed.error,
			})
		}
		const { role, prismaRole } = parsed

		// Check if user exists
		const existingUser = await prisma.user.findUnique({
			where: { id: userId },
		})

		if (!existingUser) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
			})
		}

		// Prevent self-demotion (optional - admin o'zini demote qila olmasligi)
		const currentUserId = req.user?.id
		if (currentUserId === userId && role !== 'ADMIN') {
			return res.status(403).json({
				success: false,
				message: 'You cannot change your own admin role',
			})
		}

		// Update role (+ isDriver when DELIVERY - yetkazuvchi)
		const updateData: { role: UserRole; isDriver?: boolean } = { role: prismaRole }
		if (role === 'DELIVERY') updateData.isDriver = true
		else if (String(existingUser.role) === 'DELIVERY') updateData.isDriver = false

		const user = await prisma.user.update({
			where: { id: userId },
			data: updateData,
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				isDriver: true,
				isBlocked: true,
			},
		})

		const duration = Date.now() - startTime
		console.log(`[UPDATE_USER_ROLE] ✓ User role updated: ${user.email} → ${role} | ${duration}ms`)

		return res.status(200).json({
			success: true,
			message: 'User role updated successfully',
			data: user,
		})
	} catch (error) {
		const duration = Date.now() - startTime
		console.error(`[UPDATE_USER_ROLE] Error:`, {
			message: error instanceof Error ? error.message : 'Unknown error',
			stack: error instanceof Error ? error.stack : undefined,
			code: error instanceof Prisma.PrismaClientKnownRequestError ? error.code : undefined,
			meta: error instanceof Prisma.PrismaClientKnownRequestError ? error.meta : undefined,
			duration: `${duration}ms`,
		})

		return res.status(500).json({
			success: false,
			message: 'Server error while updating user role',
		})
	}
}

// ==========================================
// UPDATE USER DRIVER STATUS (ADMIN ONLY)
// ==========================================

/**
 * PUT /api/users/:id/driver - Haydovchi statusini o'zgartirish (Admin only)
 */
export const updateUserDriver = async (req: Request, res: Response) => {
	try {
		const userId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
		const { isDriver } = req.body

		if (!userId) {
			return res.status(400).json({ success: false, message: 'User ID is required' })
		}

		if (typeof isDriver !== 'boolean') {
			return res.status(400).json({ success: false, message: 'isDriver must be a boolean' })
		}

		const existingUser = await prisma.user.findUnique({
			where: { id: userId },
			select: { id: true, role: true, isDriver: true },
		})

		if (!existingUser) {
			return res.status(404).json({ success: false, message: 'User not found' })
		}

		const updateData: { isDriver: boolean; role?: UserRole } = { isDriver }

		// Keep role consistent with driver status for non-admin users
		if (isDriver && existingUser.role !== 'ADMIN') {
			updateData.role = 'DELIVERY'
		} else if (!isDriver && existingUser.role === 'DELIVERY') {
			updateData.role = 'CUSTOMER'
		}

		const user = await prisma.user.update({
			where: { id: userId },
			data: updateData,
			select: { id: true, name: true, email: true, isDriver: true, role: true, vehicleType: true },
		})

		return res.status(200).json({
			success: true,
			message: isDriver ? "Haydovchi sifatida qo'shildi" : "Haydovchi ro'yxatdan chiqarildi",
			data: user,
		})
	} catch (error) {
		console.error('[UPDATE_USER_DRIVER] Error:', error)
		return res.status(500).json({
			success: false,
			message: 'Server error while updating driver status',
		})
	}
}

// ==========================================
// UPDATE USER STATUS (ADMIN ONLY)
// ==========================================

/**
 * PUT /api/users/:id/status - User statusini o'zgartirish (block/unblock) (Admin only)
 */
export const updateUserStatus = async (req: Request, res: Response) => {
	const startTime = Date.now()

	try {
		const { id } = req.params
		const userId = Array.isArray(id) ? id[0] : id
		const { isBlocked } = req.body

		// Validation
		if (!userId) {
			return res.status(400).json({
				success: false,
				message: 'User ID is required',
			})
		}

		if (typeof isBlocked !== 'boolean') {
			return res.status(400).json({
				success: false,
				message: 'isBlocked must be a boolean',
			})
		}

		// Check if user exists
		const existingUser = await prisma.user.findUnique({
			where: { id: userId },
		})

		if (!existingUser) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
			})
		}

		// Prevent self-blocking
		const currentUserId = req.user?.id
		if (currentUserId === userId) {
			return res.status(403).json({
				success: false,
				message: 'You cannot block yourself',
			})
		}

		// Update status
		const user = await prisma.user.update({
			where: { id: userId },
			data: { isBlocked },
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				isBlocked: true,
			},
		})

		const duration = Date.now() - startTime
		const action = isBlocked ? 'blocked' : 'unblocked'
		console.log(`[UPDATE_USER_STATUS] ✓ User ${action}: ${user.email} | ${duration}ms`)

		return res.status(200).json({
			success: true,
			message: `User ${action} successfully`,
			data: user,
		})
	} catch (error) {
		const duration = Date.now() - startTime
		console.error(`[UPDATE_USER_STATUS] Error:`, {
			error: error instanceof Error ? error.message : 'Unknown error',
			duration: `${duration}ms`,
		})

		return res.status(500).json({
			success: false,
			message: 'Server error while updating user status',
		})
	}
}

// ==========================================
// GET CURRENT USER (ME)
// ==========================================

/**
 * GET /api/users/me - Current user ma'lumotlarini olish
 */
export const getCurrentUser = async (req: Request, res: Response) => {
	const startTime = Date.now()

	try {
		const userId = req.user?.id

		if (!userId) {
			return res.status(401).json({
				success: false,
				message: 'Authentication required',
			})
		}

		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				email: true,
				name: true,
				phone: true,
				role: true,
				isBlocked: true,
				createdAt: true,
				updatedAt: true,
				_count: {
					select: {
						orders: true,
					},
				},
			},
		})

		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
			})
		}

		if (user.isBlocked) {
			return res.status(403).json({
				success: false,
				message: 'Your account has been blocked',
			})
		}

		const duration = Date.now() - startTime
		console.log(`[GET_CURRENT_USER] ✓ User fetched: ${user.email} | ${duration}ms`)

		return res.status(200).json({
			success: true,
			data: user,
		})
	} catch (error) {
		const duration = Date.now() - startTime
		console.error(`[GET_CURRENT_USER] Error:`, {
			error: error instanceof Error ? error.message : 'Unknown error',
			duration: `${duration}ms`,
		})

		return res.status(500).json({
			success: false,
			message: 'Server error while fetching current user',
		})
	}
}

// ==========================================
// UPDATE CURRENT USER (ME)
// ==========================================

/**
 * PUT /api/users/me - Current user ma'lumotlarini yangilash
 */
export const updateCurrentUser = async (req: Request, res: Response) => {
	const startTime = Date.now()

	try {
		const userId = req.user?.id
		const { name, phone } = req.body

		if (!userId) {
			return res.status(401).json({
				success: false,
				message: 'Authentication required',
			})
		}

		// Validate phone format (agar berilgan bo'lsa)
		if (phone && !isValidPhone(phone)) {
			return res.status(400).json({
				success: false,
				message: 'Invalid phone format. Use +998XXXXXXXXX or 9XXXXXXXX',
			})
		}

		// Check if user exists and not blocked
		const existingUser = await prisma.user.findUnique({
			where: { id: userId },
		})

		if (!existingUser) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
			})
		}

		if (existingUser.isBlocked) {
			return res.status(403).json({
				success: false,
				message: 'Your account has been blocked',
			})
		}

		// Update user
		const user = await prisma.user.update({
			where: { id: userId },
			data: {
				...(name && { name: name.trim() }),
				...(phone && { phone: phone.replace(/\s/g, '') }),
			},
			select: {
				id: true,
				email: true,
				name: true,
				phone: true,
				role: true,
				isBlocked: true,
				createdAt: true,
				updatedAt: true,
			},
		})

		const duration = Date.now() - startTime
		console.log(`[UPDATE_CURRENT_USER] ✓ User updated: ${user.email} | ${duration}ms`)

		return res.status(200).json({
			success: true,
			message: 'Profile updated successfully',
			data: user,
		})
	} catch (error) {
		const duration = Date.now() - startTime
		console.error(`[UPDATE_CURRENT_USER] Error:`, {
			error: error instanceof Error ? error.message : 'Unknown error',
			duration: `${duration}ms`,
		})

		return res.status(500).json({
			success: false,
			message: 'Server error while updating profile',
		})
	}
}
