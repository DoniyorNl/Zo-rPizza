// backend/src/controllers/auth.controller.ts
import { Response } from 'express'
import { supabaseAdmin } from '../config/supabase'
import { AuthRequest } from '../middleware/auth.middleware'

export const authController = {
	getCurrentUser: async (req: AuthRequest, res: Response) => {
		try {
			if (!req.userId) {
				return res.status(401).json({
					success: false,
					message: 'User ID topilmadi.'
				})
			}

			const { data: supabaseUser, error } = await supabaseAdmin.auth.admin.getUserById(req.userId)
			if (error || !supabaseUser?.user) {
				return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi.' })
			}

			const u = supabaseUser.user
			return res.status(200).json({
				success: true,
				data: {
					uid: u.id,
					email: u.email,
					displayName: u.user_metadata?.name || u.user_metadata?.full_name || '',
					emailVerified: u.email_confirmed_at != null,
					metadata: {
						creationTime: u.created_at,
						lastSignInTime: u.last_sign_in_at,
					}
				}
			})
		} catch (error: any) {
			console.error('getCurrentUser xatosi:', error.message)
			return res.status(500).json({
				success: false,
				message: "Foydalanuvchi ma'lumotlarini olishda xatolik."
			})
		}
	},

	setAdminRole: async (req: AuthRequest, res: Response) => {
		try {
			const { uid } = req.body

			if (!uid) {
				return res.status(400).json({
					success: false,
					message: 'User UID kiritilmagan.'
				})
			}

			await supabaseAdmin.auth.admin.updateUserById(uid, {
				app_metadata: { role: 'admin' },
			})

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
