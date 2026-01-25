// backend/tests/unit/controllers/tracking.controller.test.ts
import { Request, Response } from 'express'
import {
	updateDriverLocation,
	getOrderTracking,
	startDeliveryTracking,
	completeDelivery,
	getActiveDeliveries,
} from '../../../src/controllers/tracking.controller'
import prisma from '../../../src/lib/prisma'

jest.mock('../../../src/lib/prisma', () => ({
	__esModule: true,
	default: {
		user: {
			update: jest.fn(),
			findUnique: jest.fn(),
		},
		order: {
			findFirst: jest.fn(),
			findUnique: jest.fn(),
			findMany: jest.fn(),
			update: jest.fn(),
		},
		notification: {
			create: jest.fn(),
		},
	},
}))

describe('Tracking Controller', () => {
	let mockReq: Partial<Request>
	let mockRes: Partial<Response>
	let jsonMock: jest.Mock

	beforeEach(() => {
		jsonMock = jest.fn()
		mockRes = {
			json: jsonMock,
			status: jest.fn().mockReturnThis(),
		}
		jest.clearAllMocks()
	})

	describe('updateDriverLocation', () => {
		beforeEach(() => {
			mockReq = {
				user: { id: 'driver-1', email: 'driver@test.com', role: 'DRIVER', name: 'Driver Test' },
				body: { lat: 41.3, lng: 69.24 },
			}
		})

		it('should update driver location successfully', async () => {
			const mockDriver = {
				id: 'driver-1',
				currentLocation: { lat: 41.3, lng: 69.24 },
			}

			;(prisma.user.update as jest.Mock).mockResolvedValue(mockDriver)
			;(prisma.order.findFirst as jest.Mock).mockResolvedValue(null)

			await updateDriverLocation(mockReq as Request, mockRes as Response)

			expect(prisma.user.update).toHaveBeenCalledWith({
				where: { id: 'driver-1' },
				data: expect.objectContaining({
					currentLocation: expect.objectContaining({
						lat: 41.3,
						lng: 69.24,
					}),
				}),
			})

			expect(jsonMock).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					message: 'Location updated',
				}),
			)
		})

		it('should fail if coordinates are invalid', async () => {
			mockReq.body = { lat: 91, lng: 200 }

			await expect(updateDriverLocation(mockReq as Request, mockRes as Response)).rejects.toThrow(
				'Invalid location coordinates',
			)
		})

		it('should fail if user is not authenticated', async () => {
			mockReq.user = undefined

			await expect(updateDriverLocation(mockReq as Request, mockRes as Response)).rejects.toThrow(
				'User not authenticated',
			)
		})

		it('should notify customer when driver is nearby', async () => {
			const mockOrder = {
				id: 'order-1',
				userId: 'user-1',
				status: 'OUT_FOR_DELIVERY',
				deliveryLocation: { lat: 41.301, lng: 69.24 },
			}

			;(prisma.user.update as jest.Mock).mockResolvedValue({})
			;(prisma.order.findFirst as jest.Mock).mockResolvedValue(mockOrder)
			;(prisma.order.update as jest.Mock).mockResolvedValue({})
			;(prisma.notification.create as jest.Mock).mockResolvedValue({})

			await updateDriverLocation(mockReq as Request, mockRes as Response)

			expect(prisma.notification.create).toHaveBeenCalledWith(
				expect.objectContaining({
					data: expect.objectContaining({
						userId: 'user-1',
						title: 'Driver Nearby!',
					}),
				}),
			)
		})
	})

	describe('getOrderTracking', () => {
		beforeEach(() => {
			mockReq = {
				params: { orderId: 'order-1' },
				user: { id: 'user-1', email: 'user@test.com', role: 'USER', name: 'User Test' },
			}
		})

		it('should return tracking data for authorized user', async () => {
			const mockOrder = {
				id: 'order-1',
				userId: 'user-1',
				status: 'OUT_FOR_DELIVERY',
				totalAmount: 25.99,
				deliveryAddress: 'Test Address',
				driverLocation: { lat: 41.3, lng: 69.24, timestamp: new Date() },
				deliveryLocation: { lat: 41.31, lng: 69.25 },
				createdAt: new Date(),
				driverId: 'driver-1',
				user: { id: 'user-1', name: 'Test User', phone: '1234567890' },
			}

			const mockDriver = {
				id: 'driver-1',
				name: 'Test Driver',
				phone: '9876543210',
				vehicleType: 'bike',
				currentLocation: { lat: 41.3, lng: 69.24 },
			}

			;(prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder)
			;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockDriver)

			await getOrderTracking(mockReq as Request, mockRes as Response)

			expect(jsonMock).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					data: expect.objectContaining({
						order: expect.any(Object),
						tracking: expect.objectContaining({
							distance: expect.any(Number),
							eta: expect.any(Number),
						}),
					}),
				}),
			)
		})

		it('should fail if order not found', async () => {
			;(prisma.order.findUnique as jest.Mock).mockResolvedValue(null)

			await expect(getOrderTracking(mockReq as Request, mockRes as Response)).rejects.toThrow(
				'Order not found',
			)
		})

		it('should fail if user not authorized', async () => {
			const mockOrder = {
				id: 'order-1',
				userId: 'other-user',
			}

			;(prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder)
			mockReq.user = { id: 'user-1', email: 'user@test.com', role: 'USER', name: 'User Test' }

			await expect(getOrderTracking(mockReq as Request, mockRes as Response)).rejects.toThrow(
				'Not authorized to track this order',
			)
		})
	})

	describe('startDeliveryTracking', () => {
		beforeEach(() => {
			mockReq = {
				params: { orderId: 'order-1' },
				user: { id: 'driver-1', email: 'driver@test.com', role: 'DRIVER', name: 'Driver Test' },
				body: {
					deliveryLocation: { lat: 41.31, lng: 69.25 },
				},
			}
		})

		it('should start delivery tracking successfully', async () => {
			const mockOrder = {
				id: 'order-1',
				userId: 'user-1',
				driverId: 'driver-1',
				status: 'PREPARING',
			}

			const mockDriver = {
				currentLocation: { lat: 41.3, lng: 69.24 },
				vehicleType: 'bike',
			}

			;(prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder)
			;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockDriver)
			;(prisma.order.update as jest.Mock).mockResolvedValue({
				...mockOrder,
				trackingStartedAt: new Date(),
			})
			;(prisma.notification.create as jest.Mock).mockResolvedValue({})

			await startDeliveryTracking(mockReq as Request, mockRes as Response)

			expect(prisma.order.update).toHaveBeenCalledWith(
				expect.objectContaining({
					where: { id: 'order-1' },
					data: expect.objectContaining({
						status: 'OUT_FOR_DELIVERY',
					}),
				}),
			)

			expect(jsonMock).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					message: 'Delivery tracking started',
				}),
			)
		})

		it('should fail if delivery location is invalid', async () => {
			mockReq.body.deliveryLocation = { lat: 91, lng: 200 }

			await expect(startDeliveryTracking(mockReq as Request, mockRes as Response)).rejects.toThrow(
				'Invalid delivery location',
			)
		})
	})

	describe('completeDelivery', () => {
		beforeEach(() => {
			mockReq = {
				params: { orderId: 'order-1' },
				user: { id: 'driver-1', email: 'driver@test.com', role: 'DRIVER', name: 'Driver Test' },
			}
		})

		it('should complete delivery successfully', async () => {
			const mockOrder = {
				id: 'order-1',
				userId: 'user-1',
				driverId: 'driver-1',
				status: 'OUT_FOR_DELIVERY',
			}

			;(prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder)
			;(prisma.order.update as jest.Mock).mockResolvedValue({
				...mockOrder,
				status: 'DELIVERED',
			})
			;(prisma.notification.create as jest.Mock).mockResolvedValue({})

			await completeDelivery(mockReq as Request, mockRes as Response)

			expect(prisma.order.update).toHaveBeenCalledWith({
				where: { id: 'order-1' },
				data: expect.objectContaining({
					status: 'DELIVERED',
					deliveryCompletedAt: expect.any(Date),
				}),
			})

			expect(jsonMock).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					message: 'Delivery completed',
				}),
			)
		})
	})

	describe('getActiveDeliveries', () => {
		beforeEach(() => {
			mockReq = {
				user: { id: 'admin-1', email: 'admin@test.com', role: 'ADMIN', name: 'Admin Test' },
			}
		})

		it('should return all active deliveries for admin', async () => {
			const mockOrders = [
				{
					id: 'order-1',
					status: 'OUT_FOR_DELIVERY',
					driverLocation: { lat: 41.3, lng: 69.24 },
					deliveryLocation: { lat: 41.31, lng: 69.25 },
					driverId: 'driver-1',
					user: { id: 'user-1', name: 'User 1' },
				},
				{
					id: 'order-2',
					status: 'PREPARING',
					driverId: null,
					user: { id: 'user-2', name: 'User 2' },
				},
			]

			const mockDriver = {
				id: 'driver-1',
				name: 'Driver 1',
				vehicleType: 'bike',
			}

			;(prisma.order.findMany as jest.Mock).mockResolvedValue(mockOrders)
			;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockDriver)

			await getActiveDeliveries(mockReq as Request, mockRes as Response)

			expect(jsonMock).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					data: expect.any(Array),
					count: 2,
				}),
			)
		})
	})
})
