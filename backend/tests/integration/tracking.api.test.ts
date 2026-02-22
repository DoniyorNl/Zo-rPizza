// =====================================
// 📁 backend/tests/integration/tracking.api.test.ts
// 🧪 TRACKING API INTEGRATION TESTS (Controller-level)
// Controllers throw AppError; global error handler maps to response.
// =====================================

import { Request, Response } from 'express'
import {
	getOrderTracking,
	startDeliveryTracking,
	completeDelivery,
	updateDriverLocation,
} from '../../src/controllers/tracking.controller'
import { prismaMock, generateMockUser, generateMockOrder } from '../setup'

jest.mock('../../src/lib/socket', () => ({
	emitOrderUpdate: jest.fn(),
}))

const mockAuthReq = (userId: string, role: string = 'CUSTOMER') => ({
	user: { id: userId, role, email: 'test@test.com', name: 'Test User' },
})

const expectAppError = (fn: () => Promise<void>, statusCode: number, messageSubstr?: string) =>
	expect(fn()).rejects.toMatchObject({
		statusCode,
		...(messageSubstr != null && { message: expect.stringContaining(messageSubstr) }),
	})

describe('Tracking API Integration Tests', () => {
	let mockReq: Partial<Request>
	let mockRes: Partial<Response>
	let mockJson: jest.Mock
	let mockStatus: jest.Mock

	beforeEach(() => {
		mockJson = jest.fn()
		mockStatus = jest.fn().mockReturnValue({ json: mockJson })
		mockReq = {
			params: {},
			body: {},
			query: {},
			...mockAuthReq('driver-db-id'),
		}
		mockRes = { status: mockStatus, json: mockJson }
	})

	describe('GET /api/tracking/order/:orderId', () => {
		it('should throw 404 when order not found', async () => {
			prismaMock.order.findUnique.mockResolvedValue(null)
			mockReq.params = { orderId: 'non-existent' }
			;(mockReq as any).user = { id: 'user-1', role: 'CUSTOMER' }

			await expectAppError(
				() => getOrderTracking(mockReq as Request, mockRes as Response),
				404,
				'Order not found',
			)
		})

		it('should throw 403 when user is not order owner and not admin', async () => {
			const order = generateMockOrder({ id: 'ord-1', userId: 'other-user-id' })
			prismaMock.order.findUnique.mockResolvedValue({
				...order,
				user: { id: 'other-user-id', name: 'Other', phone: '+998901234567' },
			} as any)
			mockReq.params = { orderId: 'ord-1' }
			;(mockReq as any).user = { id: 'current-user-id', role: 'CUSTOMER' }

			await expectAppError(
				() => getOrderTracking(mockReq as Request, mockRes as Response),
				403,
				'authorized',
			)
		})

		it('should return tracking data for order owner', async () => {
			const order = generateMockOrder({
				id: 'ord-1',
				userId: 'user-1',
				status: 'PREPARING',
				deliveryLocation: { lat: 41.3, lng: 69.24 },
			})
			prismaMock.order.findUnique.mockResolvedValue({
				...order,
				user: { id: 'user-1', name: 'Test', phone: '+998901234567' },
			} as any)
			prismaMock.user.findUnique.mockResolvedValue(null)
			prismaMock.branch.findUnique.mockResolvedValue(null)
			mockReq.params = { orderId: 'ord-1' }
			;(mockReq as any).user = { id: 'user-1', role: 'CUSTOMER' }

			await getOrderTracking(mockReq as Request, mockRes as Response)

			expect(mockJson).toHaveBeenCalledWith({
				success: true,
				data: expect.objectContaining({
					order: expect.objectContaining({ id: 'ord-1', status: 'PREPARING' }),
					tracking: expect.any(Object),
				}),
			})
		})
	})

	describe('POST /api/tracking/order/:orderId/start', () => {
		it('should throw 400 when deliveryLocation invalid', async () => {
			mockReq.params = { orderId: 'ord-1' }
			mockReq.body = {}

			await expectAppError(
				() => startDeliveryTracking(mockReq as Request, mockRes as Response),
				400,
				'location',
			)
		})

		it('should throw 404 when order not found', async () => {
			prismaMock.order.findUnique.mockResolvedValue(null)
			mockReq.params = { orderId: 'ord-1' }
			mockReq.body = { deliveryLocation: { lat: 41.3, lng: 69.24 } }

			await expectAppError(
				() => startDeliveryTracking(mockReq as Request, mockRes as Response),
				404,
				'Order not found',
			)
		})

		it('should throw 403 when user is not driver of order', async () => {
			const order = generateMockOrder({ id: 'ord-1', driverId: 'other-driver-id' })
			prismaMock.order.findUnique.mockResolvedValue(order as any)
			mockReq.params = { orderId: 'ord-1' }
			mockReq.body = { deliveryLocation: { lat: 41.3, lng: 69.24 } }
			;(mockReq as any).user = { id: 'current-user-id', role: 'CUSTOMER' }

			await expectAppError(
				() => startDeliveryTracking(mockReq as Request, mockRes as Response),
				403,
			)
		})

		it('should start tracking and return success', async () => {
			const order = generateMockOrder({ id: 'ord-1', driverId: 'driver-db-id', userId: 'user-1' })
			const updatedOrder = {
				...order,
				trackingStartedAt: new Date(),
				deliveryStartedAt: new Date(),
				status: 'OUT_FOR_DELIVERY',
			}
			prismaMock.order.findUnique.mockResolvedValue(order as any)
			prismaMock.order.update.mockResolvedValue(updatedOrder as any)
			prismaMock.user.findUnique.mockResolvedValue({
				currentLocation: { lat: 41.29, lng: 69.23 },
				vehicleType: 'bike',
			} as any)
			prismaMock.notification.create.mockResolvedValue({} as any)
			mockReq.params = { orderId: 'ord-1' }
			mockReq.body = { deliveryLocation: { lat: 41.3, lng: 69.24 } }

			await startDeliveryTracking(mockReq as Request, mockRes as Response)

			expect(mockJson).toHaveBeenCalledWith({
				success: true,
				message: 'Delivery tracking started',
				data: expect.objectContaining({
					orderId: 'ord-1',
					eta: expect.any(Number),
					trackingStartedAt: expect.any(Date),
				}),
			})
		})
	})

	describe('POST /api/tracking/order/:orderId/complete', () => {
		it('should throw 404 when order not found', async () => {
			prismaMock.order.findUnique.mockResolvedValue(null)
			mockReq.params = { orderId: 'ord-1' }

			await expectAppError(
				() => completeDelivery(mockReq as Request, mockRes as Response),
				404,
				'Order not found',
			)
		})

		it('should throw 403 when user is not driver', async () => {
			const order = generateMockOrder({ id: 'ord-1', driverId: 'other-driver' })
			prismaMock.order.findUnique.mockResolvedValue(order as any)
			mockReq.params = { orderId: 'ord-1' }
			;(mockReq as any).user = { id: 'current-user-id', role: 'CUSTOMER' }

			await expectAppError(
				() => completeDelivery(mockReq as Request, mockRes as Response),
				403,
			)
		})

		it('should complete delivery and return success', async () => {
			const order = generateMockOrder({ id: 'ord-1', driverId: 'driver-db-id', userId: 'user-1' })
			prismaMock.order.findUnique.mockResolvedValue(order as any)
			prismaMock.order.update.mockResolvedValue({
				...order,
				status: 'DELIVERED',
				deliveryCompletedAt: new Date(),
			} as any)
			prismaMock.notification.create.mockResolvedValue({} as any)
			mockReq.params = { orderId: 'ord-1' }

			await completeDelivery(mockReq as Request, mockRes as Response)

			expect(mockJson).toHaveBeenCalledWith({
				success: true,
				message: 'Delivery completed',
			})
		})
	})

	describe('POST /api/tracking/driver/location', () => {
		it('should throw 401 when user not authenticated', async () => {
			;(mockReq as any).user = undefined
			mockReq.body = { lat: 41.3, lng: 69.24 }

			await expectAppError(
				() => updateDriverLocation(mockReq as Request, mockRes as Response),
				401,
				'authenticated',
			)
		})

		it('should throw 400 when location invalid', async () => {
			mockReq.body = {}

			await expectAppError(
				() => updateDriverLocation(mockReq as Request, mockRes as Response),
				400,
				'location',
			)
		})

		it('should update driver location and return success', async () => {
			const driver = generateMockUser({ id: 'driver-db-id' })
			prismaMock.user.update.mockResolvedValue(driver as any)
			prismaMock.order.findFirst.mockResolvedValue(null)
			mockReq.body = { lat: 41.2995, lng: 69.2401 }

			await updateDriverLocation(mockReq as Request, mockRes as Response)

			expect(mockJson).toHaveBeenCalledWith({
				success: true,
				message: 'Location updated',
				data: expect.objectContaining({
					location: { lat: 41.2995, lng: 69.2401 },
				}),
			})
		})
	})
})
