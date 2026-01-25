// =====================================
// 📁 FILE PATH: backend/src/controllers/notifications.controller.ts
// 🔔 NOTIFICATION CONTROLLER
// =====================================

import { Response } from 'express'
import prisma from '../lib/prisma'
import { AuthRequest } from '../middleware/auth.middleware'

export const notificationController = {
	/**
	 * GET /api/notifications
	 * Hozirgi user uchun barcha notificationlar
	 */
	getAllNotifications: async (req: AuthRequest, res: Response) => {
		try {
			if (!req.userId) {
				return res.status(401).json({
					success: false,
					message: 'User ID topilmadi',
				})
			}

			// Database dan user topish - firebaseUid bilan
			const dbUser = await prisma.user.findUnique({
				where: { firebaseUid: req.userId },
			})

			if (!dbUser) {
				// User database'da yo'q bo'lsa, bo'sh notifications qaytarish
				return res.status(200).json({
					success: true,
					data: {
						notifications: [],
						unreadCount: 0,
					},
				})
			}

			// Notificationlarni olish
			const notifications = await prisma.notification.findMany({
				where: { userId: dbUser.id },
				orderBy: { createdAt: 'desc' },
			})

			// O'qilmagan notificationlar soni
			const unreadCount = await prisma.notification.count({
				where: {
					userId: dbUser.id,
					isRead: false,
				},
			})

			return res.status(200).json({
				success: true,
				data: {
					notifications,
					unreadCount,
				},
			})
		} catch (error: unknown) {
			console.error('❌ getAllNotifications Error:', error)
			const errorMessage =
				error instanceof Error ? error.message : 'Notificationlarni olishda xatolik'
			console.error('Full error:', error)
			return res.status(500).json({
				success: false,
				message: errorMessage,
				...(process.env.NODE_ENV === 'development' && {
					error: error instanceof Error ? error.stack : String(error),
				}),
			})
		}
	},

	/**
	 * PATCH /api/notifications/mark-all-read
	 * Barcha notificationlarni o'qilgan qilish
	 */
	markAllAsRead: async (req: AuthRequest, res: Response) => {
		try {
			if (!req.userId) {
				return res.status(401).json({
					success: false,
					message: 'User ID topilmadi',
				})
			}

			// Database dan user topish - firebaseUid bilan
			const dbUser = await prisma.user.findUnique({
				where: { firebaseUid: req.userId },
			})

			if (!dbUser) {
				return res.status(404).json({
					success: false,
					message: 'User topilmadi',
				})
			}

			// Barcha notificationlarni o'qilgan qilish
			const result = await prisma.notification.updateMany({
				where: {
					userId: dbUser.id,
					isRead: false, // Faqat o'qilmagan notificationlar
				},
				data: {
					isRead: true,
					updatedAt: new Date(),
				},
			})

			return res.status(200).json({
				success: true,
				message: "Barcha notificationlar o'qilgan qilindi",
				data: {
					updatedCount: result.count,
				},
			})
		} catch (error: any) {
			console.error('❌ markAllAsRead Error:', error.message)
			return res.status(500).json({
				success: false,
				message: "Notificationlarni o'qilgan qilishda xatolik",
			})
		}
	},

	/**
	 * PATCH /api/notifications/:id/read
	 * Bitta notificationni o'qilgan qilish
	 */
	markAsRead: async (req: AuthRequest, res: Response) => {
		try {
			const { id } = req.params
			const notificationId = Array.isArray(id) ? id[0] : id

			if (!req.userId) {
				return res.status(401).json({
					success: false,
					message: 'User ID topilmadi',
				})
			}

			// Database dan user topish - firebaseUid bilan
			const dbUser = await prisma.user.findUnique({
				where: { firebaseUid: req.userId },
			})

			if (!dbUser) {
				return res.status(404).json({
					success: false,
					message: 'User topilmadi',
				})
			}

			// Notification topish va tekshirish
			const notification = await prisma.notification.findFirst({
				where: {
					id: parseInt(notificationId),
					userId: dbUser.id, // Faqat o'z notificationini
				},
			})

			if (!notification) {
				return res.status(404).json({
					success: false,
					message: 'Notification topilmadi',
				})
			}

			// O'qilgan qilish
			const updated = await prisma.notification.update({
				where: { id: parseInt(notificationId) },
				data: {
					isRead: true,
					updatedAt: new Date(),
				},
			})

			return res.status(200).json({
				success: true,
				message: "Notification o'qilgan qilindi",
				data: updated,
			})
		} catch (error: any) {
			console.error('❌ markAsRead Error:', error.message)
			return res.status(500).json({
				success: false,
				message: "Notification o'qilgan qilishda xatolik",
			})
		}
	},

	/**
	 * DELETE /api/notifications/:id
	 * Bitta notificationni o'chirish
	 */
	deleteNotification: async (req: AuthRequest, res: Response) => {
		try {
			const { id } = req.params
			const notificationId = Array.isArray(id) ? id[0] : id

			if (!req.userId) {
				return res.status(401).json({
					success: false,
					message: 'User ID topilmadi',
				})
			}

			// Database dan user topish - firebaseUid bilan
			const dbUser = await prisma.user.findUnique({
				where: { firebaseUid: req.userId },
			})

			if (!dbUser) {
				return res.status(404).json({
					success: false,
					message: 'User topilmadi',
				})
			}

			// Notification topish va tekshirish
			const notification = await prisma.notification.findFirst({
				where: {
					id: parseInt(notificationId),
					userId: dbUser.id, // Faqat o'z notificationini
				},
			})

			if (!notification) {
				return res.status(404).json({
					success: false,
					message: 'Notification topilmadi',
				})
			}

			// O'chirish
			await prisma.notification.delete({
				where: { id: parseInt(notificationId) },
			})

			return res.status(200).json({
				success: true,
				message: "Notification o'chirildi",
			})
		} catch (error: any) {
			console.error('❌ deleteNotification Error:', error.message)
			return res.status(500).json({
				success: false,
				message: "Notification o'chirishda xatolik",
			})
		}
	},

	/**
	 * DELETE /api/notifications/clear-all
	 * Barcha notificationlarni o'chirish
	 */
	clearAll: async (req: AuthRequest, res: Response) => {
		try {
			if (!req.userId) {
				return res.status(401).json({
					success: false,
					message: 'User ID topilmadi',
				})
			}

			// Database dan user topish - firebaseUid bilan
			const dbUser = await prisma.user.findUnique({
				where: { firebaseUid: req.userId },
			})

			if (!dbUser) {
				return res.status(404).json({
					success: false,
					message: 'User topilmadi',
				})
			}

			// Barcha notificationlarni o'chirish
			const result = await prisma.notification.deleteMany({
				where: { userId: dbUser.id },
			})

			return res.status(200).json({
				success: true,
				message: "Barcha notificationlar o'chirildi",
				data: {
					deletedCount: result.count,
				},
			})
		} catch (error: any) {
			console.error('❌ clearAll Error:', error.message)
			return res.status(500).json({
				success: false,
				message: "Notificationlarni o'chirishda xatolik",
			})
		}
	},
}
