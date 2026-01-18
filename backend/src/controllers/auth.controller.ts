// backend/src/controllers/auth.controller.ts
import { Response } from 'express'
import { auth } from '../config/firebase'
import { AuthRequest } from '../middleware/auth.middleware'

export const authController = {
	// Hozirgi foydalanuvchi ma'lumotlarini olish
	getCurrentUser: async (req: AuthRequest, res: Response) => {
		try {
			if (!req.userId) {
				return res.status(401).json({
					success: false,
					message: 'User ID topilmadi.'
				})
			}

			// Firebase dan user ma'lumotlarini olish
			const firebaseUser = await auth.getUser(req.userId)

			return res.status(200).json({
				success: true,
				data: {
					uid: firebaseUser.uid,
					email: firebaseUser.email,
					displayName: firebaseUser.displayName,
					photoURL: firebaseUser.photoURL,
					emailVerified: firebaseUser.emailVerified,
					metadata: {
						creationTime: firebaseUser.metadata.creationTime,
						lastSignInTime: firebaseUser.metadata.lastSignInTime
					}
				}
			})
		} catch (error: any) {
			console.error('getCurrentUser xatosi:', error.message)
			return res.status(500).json({
				success: false,
				message: 'Foydalanuvchi ma\'lumotlarini olishda xatolik.'
			})
		}
	},

	// Admin rolini berish (faqat super admin tomonidan)
	setAdminRole: async (req: AuthRequest, res: Response) => {
		try {
			const { uid } = req.body

			if (!uid) {
				return res.status(400).json({
					success: false,
					message: 'User UID kiritilmagan.'
				})
			}

			// Custom claims orqali admin rolini belgilash
			await auth.setCustomUserClaims(uid, { admin: true })

			return res.status(200).json({
				success: true,
				message: `User ${uid} endi admin.`
			})
		} catch (error: any) {
			console.error('setAdminRole xatosi:', error.message)
			return res.status(500).json({
				success: false,
				message: 'Admin rolini belgilashda xatolik.'
			})
		}
	}
}