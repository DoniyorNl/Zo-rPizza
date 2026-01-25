// backend/src/controllers/firebase-auth.controller.ts
import { Response } from 'express'
import { auth } from '../config/firebase'
import prisma from '../lib/prisma'
import { AuthRequest } from '../middleware/auth.middleware'

export const firebaseAuthController = {
	/**
	 * GET /api/auth/verify-token
	 * Tokenni tekshirish (development uchun)
	 */
	verifyToken: async (req: AuthRequest, res: Response) => {
		try {
			return res.status(200).json({
				success: true,
				message: "Token to'g'ri va yaroqli",
				data: {
					userId: req.userId,
					email: req.userEmail,
					timestamp: new Date().toISOString(),
				},
			})
		} catch (error: any) {
			console.error('❌ verifyToken Error:', error.message)
			return res.status(500).json({
				success: false,
				message: 'Token tekshirishda xatolik.',
			})
		}
	},

	/**
	 * GET /api/auth/me
	 * Hozirgi foydalanuvchi ma'lumotlarini olish
	 */
	getCurrentUser: async (req: AuthRequest, res: Response) => {
		try {
			if (!req.userId) {
				return res.status(401).json({
					success: false,
					message: 'User ID topilmadi.',
				})
			}

			// 1. Firebase dan user ma'lumotlarini olish
			const firebaseUser = await auth.getUser(req.userId)

			// 2. Database dan user ma'lumotlarini olish (firebaseUid bilan)
			let dbUser = await prisma.user.findUnique({
				where: { firebaseUid: req.userId },
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

			// 3. Agar DB da yo'q bo'lsa, avtomatik yaratish
			if (!dbUser) {
				console.log(`🆕 Creating new user in database: ${req.userId}`)
				dbUser = await prisma.user.create({
					data: {
						firebaseUid: req.userId,
						email: firebaseUser.email || '',
						name: firebaseUser.displayName || 'User',
						phone: firebaseUser.phoneNumber || null,
						password: null,
						role: 'CUSTOMER',
						isBlocked: false,
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
			}

			return res.status(200).json({
				success: true,
				data: {
					firebase: {
						uid: firebaseUser.uid,
						email: firebaseUser.email,
						displayName: firebaseUser.displayName,
						photoURL: firebaseUser.photoURL,
						emailVerified: firebaseUser.emailVerified,
						phoneNumber: firebaseUser.phoneNumber,
						disabled: firebaseUser.disabled,
						customClaims: firebaseUser.customClaims,
						metadata: {
							creationTime: firebaseUser.metadata.creationTime,
							lastSignInTime: firebaseUser.metadata.lastSignInTime,
							lastRefreshTime: firebaseUser.metadata.lastRefreshTime,
						},
					},
					database: dbUser,
				},
			})
		} catch (error: any) {
			console.error('❌ getCurrentUser Error:', error.message)
			return res.status(500).json({
				success: false,
				message: "Foydalanuvchi ma'lumotlarini olishda xatolik.",
				error: process.env.NODE_ENV === 'development' ? error.message : undefined,
			})
		}
	},

	/**
	 * POST /api/auth/sync
	 * Firebase user ni database bilan sinxronlashtirish
	 */
	syncUser: async (req: AuthRequest, res: Response) => {
		try {
			if (!req.userId) {
				return res.status(401).json({
					success: false,
					message: 'User ID topilmadi.',
				})
			}

			// Firebase dan user ma'lumotlarini olish
			const firebaseUser = await auth.getUser(req.userId)

			// Database da user bor-yo'qligini tekshirish (firebaseUid bilan)
			let dbUser = await prisma.user.findUnique({
				where: { firebaseUid: req.userId },
			})

			if (!dbUser) {
				// Email bilan ham tekshirish (agar email mavjud bo'lsa, firebaseUid ni update qilish)
				const existingUser = firebaseUser.email
					? await prisma.user.findUnique({ where: { email: firebaseUser.email } })
					: null

				if (existingUser) {
					// Mavjud user'ga firebaseUid qo'shish
					dbUser = await prisma.user.update({
						where: { id: existingUser.id },
						data: {
							firebaseUid: req.userId,
							name: firebaseUser.displayName || existingUser.name,
							phone: firebaseUser.phoneNumber || existingUser.phone,
						},
					})
				} else {
					// Yangi user yaratish
					dbUser = await prisma.user.create({
						data: {
							firebaseUid: req.userId,
							email: firebaseUser.email || '',
							name: firebaseUser.displayName || 'User',
							phone: firebaseUser.phoneNumber || null,
							password: null,
							role: 'CUSTOMER',
							isBlocked: false,
						},
					})
				}

				return res.status(201).json({
					success: true,
					message: 'User muvaffaqiyatli yaratildi',
					data: dbUser,
				})
			} else {
				// Mavjud user ma'lumotlarini yangilash (faqat o'zgargan ma'lumotlar)
				const updateData: any = {}

				if (firebaseUser.displayName && firebaseUser.displayName !== dbUser.name) {
					updateData.name = firebaseUser.displayName
				}
				if (firebaseUser.phoneNumber && firebaseUser.phoneNumber !== dbUser.phone) {
					updateData.phone = firebaseUser.phoneNumber
				}

				// Agar o'zgarishlar bo'lsa, update qilish
				if (Object.keys(updateData).length > 0) {
					try {
						dbUser = await prisma.user.update({
							where: { firebaseUid: req.userId },
							data: updateData,
						})
					} catch (updateError: any) {
						// Email unique constraint xatosini ignore qilish
						console.warn('⚠️ User update warning:', updateError.message)
					}
				}

				return res.status(200).json({
					success: true,
					message: "User ma'lumotlari yangilandi",
					data: dbUser,
				})
			}
		} catch (error: any) {
			console.error('❌ syncUser Error:', error.message)
			return res.status(500).json({
				success: false,
				message: 'User sinxronlashda xatolik.',
				error: process.env.NODE_ENV === 'development' ? error.message : undefined,
			})
		}
	},

	/**
	 * POST /api/auth/set-admin
	 * User ga admin rolini berish
	 */
	setAdminRole: async (req: AuthRequest, res: Response) => {
		try {
			const { uid } = req.body

			if (!uid) {
				return res.status(400).json({
					success: false,
					message: 'User UID kiritilmagan.',
				})
			}

			// 1. Firebase da custom claims orqali admin rolini belgilash
			await auth.setCustomUserClaims(uid, {
				admin: true,
				role: 'admin',
			})

			// 2. Database da ham rolni yangilash (firebaseUid bilan)
			const updatedUser = await prisma.user.update({
				where: { firebaseUid: uid },
				data: { role: 'ADMIN' },
			})

			return res.status(200).json({
				success: true,
				message: `User ${uid} ga admin huquqi berildi`,
				data: updatedUser,
			})
		} catch (error: any) {
			console.error('❌ setAdminRole Error:', error.message)
			return res.status(500).json({
				success: false,
				message: 'Admin rolini belgilashda xatolik.',
				error: process.env.NODE_ENV === 'development' ? error.message : undefined,
			})
		}
	},

	/**
	 * POST /api/auth/remove-admin
	 * Admin rolini olib tashlash
	 */
	removeAdminRole: async (req: AuthRequest, res: Response) => {
		try {
			const { uid } = req.body

			if (!uid) {
				return res.status(400).json({
					success: false,
					message: 'User UID kiritilmagan.',
				})
			}

			// 1. Firebase da custom claims dan admin rolini o'chirish
			await auth.setCustomUserClaims(uid, {
				admin: false,
				role: 'customer',
			})

			// 2. Database da ham rolni yangilash (firebaseUid bilan)
			const updatedUser = await prisma.user.update({
				where: { firebaseUid: uid },
				data: { role: 'CUSTOMER' },
			})

			return res.status(200).json({
				success: true,
				message: `User ${uid} dan admin huquqi olib tashlandi`,
				data: updatedUser,
			})
		} catch (error: any) {
			console.error('❌ removeAdminRole Error:', error.message)
			return res.status(500).json({
				success: false,
				message: 'Admin rolini olib tashlashda xatolik.',
				error: process.env.NODE_ENV === 'development' ? error.message : undefined,
			})
		}
	},

	/**
	 * GET /api/auth/users
	 * Firebase dan barcha userlarni olish (faqat admin)
	 */
	getAllFirebaseUsers: async (_req: AuthRequest, res: Response) => {
		try {
			// Firebase dan 1000 tagacha user olish
			const listUsersResult = await auth.listUsers(1000)

			const users = listUsersResult.users.map(user => ({
				uid: user.uid,
				email: user.email,
				displayName: user.displayName,
				photoURL: user.photoURL,
				emailVerified: user.emailVerified,
				disabled: user.disabled,
				metadata: {
					creationTime: user.metadata.creationTime,
					lastSignInTime: user.metadata.lastSignInTime,
				},
				customClaims: user.customClaims,
			}))

			return res.status(200).json({
				success: true,
				data: {
					users,
					count: users.length,
				},
			})
		} catch (error: any) {
			console.error('❌ getAllFirebaseUsers Error:', error.message)
			return res.status(500).json({
				success: false,
				message: 'Userlarni olishda xatolik.',
				error: process.env.NODE_ENV === 'development' ? error.message : undefined,
			})
		}
	},
}
