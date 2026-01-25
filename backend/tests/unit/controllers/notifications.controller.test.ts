// backend/tests/unit/controllers/notifications.controller.test.ts
// 🔔 NOTIFICATIONS CONTROLLER TESTS - Senior Level Best Practices

import { Response } from 'express'
import { DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended'
import prisma from '../../../src/lib/prisma'
import { AuthRequest } from '../../../src/middleware/auth.middleware'
import { notificationController } from '../../../src/controllers/notifications.controller'

// ============================================================================
// MOCK SETUP
// ============================================================================

jest.mock('../../../src/lib/prisma', () => ({
	__esModule: true,
	default: mockDeep<typeof prisma>(),
}))

const prismaMock = prisma as unknown as DeepMockProxy<typeof prisma>

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const mockAuthRequest = (overrides: any = {}): Partial<AuthRequest> => ({
	userId: 'user-123',
	params: {},
	body: {},
	query: {},
	...overrides,
})

const mockResponse = (): Partial<Response> => {
	const res: Partial<Response> = {
		status: jest.fn().mockReturnThis(),
		json: jest.fn().mockReturnThis(),
	}
	return res
}

// Mock data generators
const generateMockUser = (overrides: any = {}) => ({
	id: 'user-123',
	email: 'test@example.com',
	name: 'Test User',
	firebaseUid: 'firebase-123',
	role: 'CUSTOMER' as const,
	createdAt: new Date(),
	updatedAt: new Date(),
	...overrides,
})

const generateMockNotification = (overrides: any = {}) => ({
	id: 1,
	userId: 'user-123',
	title: 'Order Delivered',
	message: 'Your order #2026-001 has been delivered!',
	type: 'ORDER_UPDATE',
	isRead: false,
	createdAt: new Date(),
	updatedAt: new Date(),
	...overrides,
})

// ============================================================================
// TESTS
// ============================================================================

describe('Notifications Controller', () => {
	beforeEach(() => {
		mockReset(prismaMock)
		jest.clearAllMocks()
		jest.spyOn(console, 'error').mockImplementation()
	})

	afterEach(() => {
		jest.restoreAllMocks()
	})

	// ========================================================================
	// getAllNotifications Tests
	// ========================================================================
	describe('getAllNotifications', () => {
		it('should return all notifications for authenticated user', async () => {
			// Arrange
			const req = mockAuthRequest({ userId: 'user-123' })
			const res = mockResponse()

			const mockUser = generateMockUser()
			const mockNotifications = [
				generateMockNotification({ id: 1, isRead: false }),
				generateMockNotification({ id: 2, isRead: true }),
				generateMockNotification({ id: 3, isRead: false }),
			]

			prismaMock.user.findUnique.mockResolvedValue(mockUser as any)
			prismaMock.notification.findMany.mockResolvedValue(mockNotifications as any)
			prismaMock.notification.count.mockResolvedValue(2) // 2 unread

			// Act
			await notificationController.getAllNotifications(req as AuthRequest, res as Response)

			// Assert
			expect(res.status).toHaveBeenCalledWith(200)
			expect(res.json).toHaveBeenCalledWith({
				success: true,
				data: {
					notifications: mockNotifications,
					unreadCount: 2,
				},
			})
			expect(prismaMock.notification.findMany).toHaveBeenCalledWith({
				where: { userId: 'user-123' },
				orderBy: { createdAt: 'desc' },
			})
		})

		it('should return 401 if userId is missing', async () => {
			// Arrange
			const req = mockAuthRequest({ userId: undefined })
			const res = mockResponse()

			// Act
			await notificationController.getAllNotifications(req as AuthRequest, res as Response)

			// Assert
			expect(res.status).toHaveBeenCalledWith(401)
			expect(res.json).toHaveBeenCalledWith({
				success: false,
				message: 'User ID topilmadi',
			})
		})

		it('should return 404 if user not found in database', async () => {
			// Arrange
			const req = mockAuthRequest({ userId: 'nonexistent-user' })
			const res = mockResponse()

			prismaMock.user.findUnique.mockResolvedValue(null)

			// Act
			await notificationController.getAllNotifications(req as AuthRequest, res as Response)

			// Assert
			expect(res.status).toHaveBeenCalledWith(404)
			expect(res.json).toHaveBeenCalledWith({
				success: false,
				message: 'User topilmadi',
			})
		})

		it('should return empty array if no notifications', async () => {
			// Arrange
			const req = mockAuthRequest()
			const res = mockResponse()

			prismaMock.user.findUnique.mockResolvedValue(generateMockUser() as any)
			prismaMock.notification.findMany.mockResolvedValue([])
			prismaMock.notification.count.mockResolvedValue(0)

			// Act
			await notificationController.getAllNotifications(req as AuthRequest, res as Response)

			// Assert
			expect(res.status).toHaveBeenCalledWith(200)
			expect(res.json).toHaveBeenCalledWith({
				success: true,
				data: {
					notifications: [],
					unreadCount: 0,
				},
			})
		})

		it('should handle database errors', async () => {
			// Arrange
			const req = mockAuthRequest()
			const res = mockResponse()

			prismaMock.user.findUnique.mockRejectedValue(new Error('Database connection failed'))

			// Act
			await notificationController.getAllNotifications(req as AuthRequest, res as Response)

			// Assert
			expect(res.status).toHaveBeenCalledWith(500)
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: false,
					message: expect.stringContaining('Database connection failed'),
				}),
			)
		})
	})

	// ========================================================================
	// markAllAsRead Tests
	// ========================================================================
	describe('markAllAsRead', () => {
		it('should mark all unread notifications as read', async () => {
			// Arrange
			const req = mockAuthRequest({ userId: 'user-123' })
			const res = mockResponse()

			prismaMock.user.findUnique.mockResolvedValue(generateMockUser() as any)
			prismaMock.notification.updateMany.mockResolvedValue({ count: 5 } as any)

			// Act
			await notificationController.markAllAsRead(req as AuthRequest, res as Response)

			// Assert
			expect(res.status).toHaveBeenCalledWith(200)
			expect(res.json).toHaveBeenCalledWith({
				success: true,
				message: "Barcha notificationlar o'qilgan qilindi",
				data: {
					updatedCount: 5,
				},
			})
			expect(prismaMock.notification.updateMany).toHaveBeenCalledWith({
				where: {
					userId: 'user-123',
					isRead: false,
				},
				data: {
					isRead: true,
					updatedAt: expect.any(Date),
				},
			})
		})

		it('should return 0 count if no unread notifications', async () => {
			// Arrange
			const req = mockAuthRequest()
			const res = mockResponse()

			prismaMock.user.findUnique.mockResolvedValue(generateMockUser() as any)
			prismaMock.notification.updateMany.mockResolvedValue({ count: 0 } as any)

			// Act
			await notificationController.markAllAsRead(req as AuthRequest, res as Response)

			// Assert
			expect(res.status).toHaveBeenCalledWith(200)
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					data: { updatedCount: 0 },
				}),
			)
		})

		it('should return 401 if userId is missing', async () => {
			// Arrange
			const req = mockAuthRequest({ userId: undefined })
			const res = mockResponse()

			// Act
			await notificationController.markAllAsRead(req as AuthRequest, res as Response)

			// Assert
			expect(res.status).toHaveBeenCalledWith(401)
		})

		it('should return 404 if user not found', async () => {
			// Arrange
			const req = mockAuthRequest()
			const res = mockResponse()

			prismaMock.user.findUnique.mockResolvedValue(null)

			// Act
			await notificationController.markAllAsRead(req as AuthRequest, res as Response)

			// Assert
			expect(res.status).toHaveBeenCalledWith(404)
		})

		it('should handle database errors', async () => {
			// Arrange
			const req = mockAuthRequest()
			const res = mockResponse()

			prismaMock.user.findUnique.mockRejectedValue(new Error('Database error'))

			// Act
			await notificationController.markAllAsRead(req as AuthRequest, res as Response)

			// Assert
			expect(res.status).toHaveBeenCalledWith(500)
		})
	})

	// ========================================================================
	// markAsRead Tests
	// ========================================================================
	describe('markAsRead', () => {
		it('should mark single notification as read', async () => {
			// Arrange
			const req = mockAuthRequest({
				userId: 'user-123',
				params: { id: '1' },
			})
			const res = mockResponse()

			const mockNotification = generateMockNotification({ id: 1, isRead: false })
			const updatedNotification = { ...mockNotification, isRead: true }

			prismaMock.user.findUnique.mockResolvedValue(generateMockUser() as any)
			prismaMock.notification.findFirst.mockResolvedValue(mockNotification as any)
			prismaMock.notification.update.mockResolvedValue(updatedNotification as any)

			// Act
			await notificationController.markAsRead(req as AuthRequest, res as Response)

			// Assert
			expect(res.status).toHaveBeenCalledWith(200)
			expect(res.json).toHaveBeenCalledWith({
				success: true,
				message: "Notification o'qilgan qilindi",
				data: updatedNotification,
			})
			expect(prismaMock.notification.update).toHaveBeenCalledWith({
				where: { id: 1 },
				data: {
					isRead: true,
					updatedAt: expect.any(Date),
				},
			})
		})

		it('should handle array ID parameter', async () => {
			// Arrange
			const req = mockAuthRequest({
				params: { id: ['5'] },
			})
			const res = mockResponse()

			prismaMock.user.findUnique.mockResolvedValue(generateMockUser() as any)
			prismaMock.notification.findFirst.mockResolvedValue(
				generateMockNotification({ id: 5 }) as any,
			)
			prismaMock.notification.update.mockResolvedValue(
				generateMockNotification({ id: 5, isRead: true }) as any,
			)

			// Act
			await notificationController.markAsRead(req as AuthRequest, res as Response)

			// Assert
			expect(prismaMock.notification.update).toHaveBeenCalledWith({
				where: { id: 5 },
				data: expect.any(Object),
			})
		})

		it('should return 401 if userId is missing', async () => {
			// Arrange
			const req = mockAuthRequest({
				userId: undefined,
				params: { id: '1' },
			})
			const res = mockResponse()

			// Act
			await notificationController.markAsRead(req as AuthRequest, res as Response)

			// Assert
			expect(res.status).toHaveBeenCalledWith(401)
		})

		it('should return 404 if notification not found', async () => {
			// Arrange
			const req = mockAuthRequest({
				params: { id: '999' },
			})
			const res = mockResponse()

			prismaMock.user.findUnique.mockResolvedValue(generateMockUser() as any)
			prismaMock.notification.findFirst.mockResolvedValue(null)

			// Act
			await notificationController.markAsRead(req as AuthRequest, res as Response)

			// Assert
			expect(res.status).toHaveBeenCalledWith(404)
			expect(res.json).toHaveBeenCalledWith({
				success: false,
				message: 'Notification topilmadi',
			})
		})

		it('should only allow users to mark their own notifications', async () => {
			// Arrange
			const req = mockAuthRequest({
				userId: 'user-123',
				params: { id: '1' },
			})
			const res = mockResponse()

			prismaMock.user.findUnique.mockResolvedValue(generateMockUser() as any)
			prismaMock.notification.findFirst.mockResolvedValue(null) // Not found for this user

			// Act
			await notificationController.markAsRead(req as AuthRequest, res as Response)

			// Assert
			expect(prismaMock.notification.findFirst).toHaveBeenCalledWith({
				where: {
					id: 1,
					userId: 'user-123', // Security check
				},
			})
			expect(res.status).toHaveBeenCalledWith(404)
		})

		it('should handle database errors', async () => {
			// Arrange
			const req = mockAuthRequest({ params: { id: '1' } })
			const res = mockResponse()

			prismaMock.user.findUnique.mockRejectedValue(new Error('Database error'))

			// Act
			await notificationController.markAsRead(req as AuthRequest, res as Response)

			// Assert
			expect(res.status).toHaveBeenCalledWith(500)
		})
	})

	// ========================================================================
	// deleteNotification Tests
	// ========================================================================
	describe('deleteNotification', () => {
		it('should delete notification successfully', async () => {
			// Arrange
			const req = mockAuthRequest({
				params: { id: '1' },
			})
			const res = mockResponse()

			prismaMock.user.findUnique.mockResolvedValue(generateMockUser() as any)
			prismaMock.notification.findFirst.mockResolvedValue(
				generateMockNotification({ id: 1 }) as any,
			)
			prismaMock.notification.delete.mockResolvedValue({} as any)

			// Act
			await notificationController.deleteNotification(req as AuthRequest, res as Response)

			// Assert
			expect(res.status).toHaveBeenCalledWith(200)
			expect(res.json).toHaveBeenCalledWith({
				success: true,
				message: "Notification o'chirildi",
			})
			expect(prismaMock.notification.delete).toHaveBeenCalledWith({
				where: { id: 1 },
			})
		})

		it('should handle array ID parameter', async () => {
			// Arrange
			const req = mockAuthRequest({
				params: { id: ['3'] },
			})
			const res = mockResponse()

			prismaMock.user.findUnique.mockResolvedValue(generateMockUser() as any)
			prismaMock.notification.findFirst.mockResolvedValue(
				generateMockNotification({ id: 3 }) as any,
			)
			prismaMock.notification.delete.mockResolvedValue({} as any)

			// Act
			await notificationController.deleteNotification(req as AuthRequest, res as Response)

			// Assert
			expect(prismaMock.notification.delete).toHaveBeenCalledWith({
				where: { id: 3 },
			})
		})

		it('should return 401 if userId is missing', async () => {
			// Arrange
			const req = mockAuthRequest({
				userId: undefined,
				params: { id: '1' },
			})
			const res = mockResponse()

			// Act
			await notificationController.deleteNotification(req as AuthRequest, res as Response)

			// Assert
			expect(res.status).toHaveBeenCalledWith(401)
		})

		it('should return 404 if notification not found', async () => {
			// Arrange
			const req = mockAuthRequest({
				params: { id: '999' },
			})
			const res = mockResponse()

			prismaMock.user.findUnique.mockResolvedValue(generateMockUser() as any)
			prismaMock.notification.findFirst.mockResolvedValue(null)

			// Act
			await notificationController.deleteNotification(req as AuthRequest, res as Response)

			// Assert
			expect(res.status).toHaveBeenCalledWith(404)
		})

		it('should only allow users to delete their own notifications', async () => {
			// Arrange
			const req = mockAuthRequest({
				userId: 'user-123',
				params: { id: '1' },
			})
			const res = mockResponse()

			prismaMock.user.findUnique.mockResolvedValue(generateMockUser() as any)
			prismaMock.notification.findFirst.mockResolvedValue(null)

			// Act
			await notificationController.deleteNotification(req as AuthRequest, res as Response)

			// Assert
			expect(prismaMock.notification.findFirst).toHaveBeenCalledWith({
				where: {
					id: 1,
					userId: 'user-123',
				},
			})
			expect(res.status).toHaveBeenCalledWith(404)
		})

		it('should handle database errors', async () => {
			// Arrange
			const req = mockAuthRequest({ params: { id: '1' } })
			const res = mockResponse()

			prismaMock.user.findUnique.mockRejectedValue(new Error('Database error'))

			// Act
			await notificationController.deleteNotification(req as AuthRequest, res as Response)

			// Assert
			expect(res.status).toHaveBeenCalledWith(500)
		})
	})

	// ========================================================================
	// clearAll Tests
	// ========================================================================
	describe('clearAll', () => {
		it('should delete all notifications for user', async () => {
			// Arrange
			const req = mockAuthRequest()
			const res = mockResponse()

			prismaMock.user.findUnique.mockResolvedValue(generateMockUser() as any)
			prismaMock.notification.deleteMany.mockResolvedValue({ count: 10 } as any)

			// Act
			await notificationController.clearAll(req as AuthRequest, res as Response)

			// Assert
			expect(res.status).toHaveBeenCalledWith(200)
			expect(res.json).toHaveBeenCalledWith({
				success: true,
				message: "Barcha notificationlar o'chirildi",
				data: {
					deletedCount: 10,
				},
			})
			expect(prismaMock.notification.deleteMany).toHaveBeenCalledWith({
				where: { userId: 'user-123' },
			})
		})

		it('should return 0 count if no notifications to delete', async () => {
			// Arrange
			const req = mockAuthRequest()
			const res = mockResponse()

			prismaMock.user.findUnique.mockResolvedValue(generateMockUser() as any)
			prismaMock.notification.deleteMany.mockResolvedValue({ count: 0 } as any)

			// Act
			await notificationController.clearAll(req as AuthRequest, res as Response)

			// Assert
			expect(res.status).toHaveBeenCalledWith(200)
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					data: { deletedCount: 0 },
				}),
			)
		})

		it('should return 401 if userId is missing', async () => {
			// Arrange
			const req = mockAuthRequest({ userId: undefined })
			const res = mockResponse()

			// Act
			await notificationController.clearAll(req as AuthRequest, res as Response)

			// Assert
			expect(res.status).toHaveBeenCalledWith(401)
		})

		it('should return 404 if user not found', async () => {
			// Arrange
			const req = mockAuthRequest()
			const res = mockResponse()

			prismaMock.user.findUnique.mockResolvedValue(null)

			// Act
			await notificationController.clearAll(req as AuthRequest, res as Response)

			// Assert
			expect(res.status).toHaveBeenCalledWith(404)
		})

		it('should handle database errors', async () => {
			// Arrange
			const req = mockAuthRequest()
			const res = mockResponse()

			prismaMock.user.findUnique.mockRejectedValue(new Error('Database error'))

			// Act
			await notificationController.clearAll(req as AuthRequest, res as Response)

			// Assert
			expect(res.status).toHaveBeenCalledWith(500)
		})
	})
})
