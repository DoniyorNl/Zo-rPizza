// =====================================
// 📁 FILE PATH: backend/tests/integration/orders.api.test.ts
// 🧪 ORDERS API INTEGRATION TESTS (Controller-level)
// =====================================

import { Request, Response } from 'express'
import {
	createOrder,
	deleteOrder,
	getUserOrders,
	updateOrderStatus,
} from '../../src/controllers/orders.controller'
import { generateMockOrder, generateMockProduct, generateMockUser, prismaMock } from '../setup'

describe('Orders API Integration Tests (Controller-level)', () => {
	let mockReq: Partial<Request>
	let mockRes: Partial<Response>
	let mockJson: jest.Mock
	let mockStatus: jest.Mock

	beforeEach(() => {
		mockJson = jest.fn()
		mockStatus = jest.fn().mockReturnValue({ json: mockJson })
		mockReq = {
			query: {},
			body: {},
			params: {},
		}
		mockRes = {
			status: mockStatus,
			json: mockJson,
		}
	})

	describe('POST /api/orders', () => {
		it('should create an order with valid data', async () => {
			const mockUser = generateMockUser({ id: 'user-1' })
			const mockProduct = generateMockProduct({ id: 'prod-1', basePrice: 50000 })

			mockReq.body = {
				userId: 'user-1',
				items: [
					{
						productId: 'prod-1',
						quantity: 2,
					},
				],
				deliveryAddress: 'Test Address',
				deliveryPhone: '+998901234567',
				paymentMethod: 'CASH',
			}

			// Mock database calls
			prismaMock.user.findUnique.mockResolvedValue(mockUser as any)
			prismaMock.product.findUnique.mockResolvedValue(mockProduct as any)

			// Mock findFirst for order number generation
			prismaMock.order.findFirst.mockResolvedValue(null)

			const mockCreatedOrder = generateMockOrder({
				id: 'order-1',
				userId: 'user-1',
				totalPrice: 100000,
				status: 'PENDING',
			})
			prismaMock.order.create.mockResolvedValue(mockCreatedOrder as any)

			await createOrder(mockReq as Request, mockRes as Response)

			expect(mockStatus).toHaveBeenCalledWith(201)
			expect(mockJson).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					data: expect.objectContaining({
						id: 'order-1',
						totalPrice: 100000,
					}),
				}),
			)
		})

		it('should return 400 if product is not active', async () => {
			const mockUser = generateMockUser({ id: 'user-1' })
			const mockProduct = generateMockProduct({ id: 'prod-1', isActive: false })

			mockReq.body = {
				userId: 'user-1',
				items: [{ productId: 'prod-1', quantity: 1 }],
				deliveryAddress: 'Test Address',
				deliveryPhone: '+998901234567',
			}

			prismaMock.user.findUnique.mockResolvedValue(mockUser as any)
			prismaMock.product.findUnique.mockResolvedValue(mockProduct as any)

			await createOrder(mockReq as Request, mockRes as Response)

			expect(mockStatus).toHaveBeenCalledWith(400)
			expect(mockJson).toHaveBeenCalledWith(
				expect.objectContaining({
					message: expect.stringContaining('not available'),
				}),
			)
		})

		it('should auto-create user if not found', async () => {
			mockReq.body = {
				userId: 'user-999',
				email: 'newuser@test.com',
				items: [{ productId: 'prod-1', quantity: 1, variationId: 'var-1' }],
				deliveryAddress: 'Test Address',
				deliveryPhone: '+998901234567',
			}

			const newUser = { id: 'user-999', firebaseUid: 'user-999', email: 'newuser@test.com' }
			const product = {
				id: 'prod-1',
				basePrice: 100,
				isActive: true,
				variations: [{ id: 'var-1', price: 120 }],
			}

			prismaMock.user.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(null)
			prismaMock.user.create.mockResolvedValue(newUser as any)
			prismaMock.product.findUnique.mockResolvedValue(product as any)
			prismaMock.productVariation.findFirst.mockResolvedValue({ id: 'var-1', price: 120 } as any)
			prismaMock.order.findFirst.mockResolvedValue(null)
			prismaMock.order.create.mockResolvedValue({ id: 'order-1', orderNumber: '#0001' } as any)

			await createOrder(mockReq as Request, mockRes as Response)

			expect(prismaMock.user.create).toHaveBeenCalled()
			expect(mockStatus).toHaveBeenCalledWith(201)
		})
	})

	describe('GET /api/orders/user/:userId', () => {
		it('should return user orders', async () => {
			; (mockReq as any).userId = 'user-1'
			mockReq.params = { userId: 'user-1' }
			const mockUser = generateMockUser({ id: 'user-1', firebaseUid: 'user-1' })
			const mockOrders = [
				generateMockOrder({ id: 'order-1', userId: 'user-1' }),
				generateMockOrder({ id: 'order-2', userId: 'user-1' }),
			]

			prismaMock.user.findFirst.mockResolvedValue(mockUser as any)
			prismaMock.order.findMany.mockResolvedValue(mockOrders as any)

			await getUserOrders(mockReq as Request, mockRes as Response)

			expect(mockStatus).toHaveBeenCalledWith(200)
			expect(mockJson).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					count: 2,
					data: mockOrders,
				}),
			)
		})
	})

	describe('PATCH /api/orders/:id/status', () => {
		it('should update order status', async () => {
			mockReq.params = { id: 'order-1' }
			mockReq.body = { status: 'DELIVERED' }

			const mockOrder = generateMockOrder({ id: 'order-1', status: 'PENDING' })
			const updatedOrder = { ...mockOrder, status: 'DELIVERED' }

			prismaMock.order.findUnique.mockResolvedValue(mockOrder as any)
			prismaMock.order.update.mockResolvedValue(updatedOrder as any)

			await updateOrderStatus(mockReq as Request, mockRes as Response)

			expect(mockStatus).toHaveBeenCalledWith(200)
			expect(mockJson).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					data: expect.objectContaining({ status: 'DELIVERED' }),
				}),
			)
		})

		it('should return 404 if order not found', async () => {
			mockReq.params = { id: 'order-999' }
			prismaMock.order.findUnique.mockResolvedValue(null)

			await updateOrderStatus(mockReq as Request, mockRes as Response)

			expect(mockStatus).toHaveBeenCalledWith(404)
		})
	})

	describe('DELETE /api/orders/:id', () => {
		it('should delete pending order', async () => {
			; (mockReq as any).userId = 'user-1'
			mockReq.params = { id: 'order-1' }
			const mockUser = generateMockUser({ id: 'user-1', firebaseUid: 'user-1' })
			const mockOrder = generateMockOrder({ id: 'order-1', status: 'PENDING', userId: 'user-1' })

			prismaMock.user.findFirst.mockResolvedValue(mockUser as any)
			prismaMock.order.findUnique.mockResolvedValue(mockOrder as any)
			prismaMock.order.delete.mockResolvedValue(mockOrder as any)

			await deleteOrder(mockReq as Request, mockRes as Response)

			expect(mockStatus).toHaveBeenCalledWith(200)
			expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({ success: true }))
		})

		it('should not delete non-pending order', async () => {
			; (mockReq as any).userId = 'user-1'
			mockReq.params = { id: 'order-1' }
			const mockUser = generateMockUser({ id: 'user-1', firebaseUid: 'user-1' })
			const mockOrder = generateMockOrder({ id: 'order-1', status: 'DELIVERED', userId: 'user-1' })

			prismaMock.user.findFirst.mockResolvedValue(mockUser as any)
			prismaMock.order.findUnique.mockResolvedValue(mockOrder as any)

			await deleteOrder(mockReq as Request, mockRes as Response)

			expect(mockStatus).toHaveBeenCalledWith(400)
			expect(mockJson).toHaveBeenCalledWith(
				expect.objectContaining({
					message: expect.stringContaining('Can only delete pending orders'),
				}),
			)
		})
	})
})
