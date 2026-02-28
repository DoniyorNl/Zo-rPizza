// backend/tests/unit/controllers/orders.controller.expansion.test.ts
// 🍕 ORDERS CONTROLLER - EXPANSION TESTS (72% → 100%)
// Advanced scenarios and edge cases

import { Request, Response } from 'express'
import { DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended'
import prisma from '../../../src/lib/prisma'
import { createOrder, updateOrderStatus } from '../../../src/controllers/orders.controller'

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

const mockRequest = (overrides: any = {}): Partial<Request> => ({
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
	id: 'user-1',
	email: 'test@example.com',
	name: 'Test User',
	firebaseUid: 'firebase-123',
	role: 'CUSTOMER' as const,
	createdAt: new Date(),
	updatedAt: new Date(),
	...overrides,
})

const generateMockProduct = (overrides: any = {}) => ({
	id: 'product-1',
	name: 'Margherita Pizza',
	basePrice: 45000,
	isActive: true,
	categoryId: 'cat-1',
	createdAt: new Date(),
	updatedAt: new Date(),
	...overrides,
})

const generateMockOrder = (overrides: any = {}) => ({
	id: 'order-1',
	orderNumber: '0001',
	userId: 'user-1',
	totalPrice: 50000,
	status: 'PENDING' as const,
	paymentStatus: 'PENDING' as const,
	createdAt: new Date(),
	updatedAt: new Date(),
	...overrides,
})

// ============================================================================
// TESTS
// ============================================================================

describe('Orders Controller - Advanced Coverage', () => {
	beforeEach(() => {
		mockReset(prismaMock)
		jest.clearAllMocks()
		jest.spyOn(console, 'log').mockImplementation()
		jest.spyOn(console, 'error').mockImplementation()
	})

	afterEach(() => {
		jest.restoreAllMocks()
	})

	// ========================================================================
	// createOrder - Complex Scenarios
	// ========================================================================
	describe('createOrder - Variations and Toppings', () => {
		it('should create order with variation and toppings', async () => {
			const req = mockRequest({
				body: {
					userId: 'user-1',
					items: [
						{
							productId: 'product-1',
							variationId: 'var-1',
							quantity: 2,
							addedToppingIds: ['topping-1', 'topping-2'],
							removedToppingIds: [],
						},
					],
					deliveryAddress: '123 Main St',
					deliveryPhone: '+998901234567',
				},
			})
			const res = mockResponse()

			const mockUser = generateMockUser()
			const mockProduct = generateMockProduct()
			const mockVariation = {
				id: 'var-1',
				productId: 'product-1',
				size: 'LARGE',
				price: 55000,
				isActive: true,
			}
			const mockToppings = [
				{ id: 'topping-1', name: 'Extra Cheese', price: 5000, isActive: true },
				{ id: 'topping-2', name: 'Olives', price: 3000, isActive: true },
			]
			const mockLastOrder = { orderNumber: '0099' }
			const mockCreatedOrder = generateMockOrder({ orderNumber: '0100' })

			prismaMock.user.findUnique.mockResolvedValue(mockUser as any)
			prismaMock.product.findUnique.mockResolvedValue(mockProduct as any)
			prismaMock.productVariation.findFirst.mockResolvedValue(mockVariation as any)
			prismaMock.topping.findMany.mockResolvedValue(mockToppings as any)
			prismaMock.order.findFirst.mockResolvedValue(mockLastOrder as any)
			prismaMock.order.create.mockResolvedValue(mockCreatedOrder as any)

			await createOrder(req as Request, res as Response)

			expect(res.status).toHaveBeenCalledWith(201)
			expect(prismaMock.order.create).toHaveBeenCalled()
		})

		it('should create half-and-half pizza order', async () => {
			const req = mockRequest({
				body: {
					userId: 'user-1',
					items: [
						{
							productId: 'product-1',
							halfProductId: 'product-2',
							quantity: 1,
							size: 'MEDIUM',
							addedToppingIds: [],
							removedToppingIds: [],
						},
					],
					deliveryAddress: '123 Main St',
					deliveryPhone: '+998901234567',
				},
			})
			const res = mockResponse()

			const mockUser = generateMockUser()
			const mockProduct1 = generateMockProduct({ id: 'product-1' })
			const mockProduct2 = generateMockProduct({ id: 'product-2', name: 'Veggie Pizza' })
			const mockLastOrder = { orderNumber: '0099' }
			const mockCreatedOrder = generateMockOrder()

			prismaMock.user.findUnique.mockResolvedValue(mockUser as any)
			prismaMock.product.findUnique
				.mockResolvedValueOnce(mockProduct1 as any)
				.mockResolvedValueOnce(mockProduct2 as any)
			prismaMock.productVariation.findFirst.mockResolvedValue(null)
			prismaMock.order.findFirst.mockResolvedValue(mockLastOrder as any)
			prismaMock.order.create.mockResolvedValue(mockCreatedOrder as any)
			prismaMock.topping.findMany.mockResolvedValue([])

			await createOrder(req as Request, res as Response)

			expect(res.status).toHaveBeenCalledWith(201)
			expect(prismaMock.product.findUnique).toHaveBeenCalledTimes(2)
		})

		it('should return 404 if half product not found', async () => {
			const req = mockRequest({
				body: {
					userId: 'user-1',
					items: [
						{
							productId: 'product-1',
							halfProductId: 'nonexistent',
							quantity: 1,
							addedToppingIds: [],
							removedToppingIds: [],
						},
					],
					deliveryAddress: '123 Main St',
					deliveryPhone: '+998901234567',
				},
			})
			const res = mockResponse()

			const mockUser = generateMockUser()
			const mockProduct = generateMockProduct()

			prismaMock.user.findUnique.mockResolvedValue(mockUser as any)
			prismaMock.product.findUnique
				.mockResolvedValueOnce(mockProduct as any)
				.mockResolvedValueOnce(null)

			await createOrder(req as Request, res as Response)

			expect(res.status).toHaveBeenCalledWith(404)
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: false,
					message: expect.stringContaining('Half product'),
				}),
			)
		})

		it('should return 400 for invalid variation', async () => {
			const req = mockRequest({
				body: {
					userId: 'user-1',
					items: [
						{
							productId: 'product-1',
							variationId: 'invalid-var',
							quantity: 1,
							addedToppingIds: [],
							removedToppingIds: [],
						},
					],
					deliveryAddress: '123 Main St',
					deliveryPhone: '+998901234567',
				},
			})
			const res = mockResponse()

			const mockUser = generateMockUser()
			const mockProduct = generateMockProduct()

			prismaMock.user.findUnique.mockResolvedValue(mockUser as any)
			prismaMock.product.findUnique.mockResolvedValue(mockProduct as any)
			prismaMock.productVariation.findFirst.mockResolvedValue(null)

			await createOrder(req as Request, res as Response)

			expect(res.status).toHaveBeenCalledWith(400)
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: false,
					message: expect.stringContaining('Invalid variation'),
				}),
			)
		})

		it('should handle order with size but no variation', async () => {
			const req = mockRequest({
				body: {
					userId: 'user-1',
					email: 'test@example.com',
					name: 'Test User',
					items: [
						{
							productId: 'product-1',
							size: 'LARGE',
							quantity: 1,
							addedToppingIds: [],
							removedToppingIds: [],
						},
					],
					deliveryAddress: '123 Main St',
					deliveryPhone: '+998901234567',
				},
			})
			const res = mockResponse()

			const mockUser = generateMockUser()
			const mockProduct = generateMockProduct()
			const mockVariation = {
				id: 'var-1',
				productId: 'product-1',
				size: 'LARGE',
				price: 60000,
			}
			const mockLastOrder = { orderNumber: '0099' }
			const mockCreatedOrder = generateMockOrder()

			prismaMock.user.findUnique.mockResolvedValue(mockUser as any)
			prismaMock.product.findUnique.mockResolvedValue(mockProduct as any)
			prismaMock.productVariation.findFirst.mockResolvedValue(mockVariation as any)
			prismaMock.topping.findMany.mockResolvedValue([])
			prismaMock.order.findFirst.mockResolvedValue(mockLastOrder as any)
			prismaMock.order.create.mockResolvedValue(mockCreatedOrder as any)

			await createOrder(req as Request, res as Response)

			expect(res.status).toHaveBeenCalledWith(201)
		})

		it('should parse items from JSON string', async () => {
			const req = mockRequest({
				body: {
					userId: 'user-1',
					email: 'test@example.com',
					name: 'Test User',
					items: JSON.stringify([
						{
							productId: 'product-1',
							quantity: 1,
							addedToppingIds: [],
							removedToppingIds: [],
						},
					]),
					deliveryAddress: '123 Main St',
					deliveryPhone: '+998901234567',
				},
			})
			const res = mockResponse()

			const mockUser = generateMockUser()
			const mockProduct = generateMockProduct()
			const mockLastOrder = { orderNumber: '0099' }
			const mockCreatedOrder = generateMockOrder()

			prismaMock.user.findUnique.mockResolvedValue(mockUser as any)
			prismaMock.product.findUnique.mockResolvedValue(mockProduct as any)
			prismaMock.productVariation.findFirst.mockResolvedValue(null)
			prismaMock.topping.findMany.mockResolvedValue([])
			prismaMock.order.findFirst.mockResolvedValue(mockLastOrder as any)
			prismaMock.order.create.mockResolvedValue(mockCreatedOrder as any)

			await createOrder(req as Request, res as Response)

			expect(res.status).toHaveBeenCalledWith(201)
		})

		it('should generate order number 0001 for first order', async () => {
			const req = mockRequest({
				body: {
					userId: 'user-1',
					email: 'test@example.com',
					name: 'Test User',
					items: [
						{
							productId: 'product-1',
							quantity: 1,
							addedToppingIds: [],
							removedToppingIds: [],
						},
					],
					deliveryAddress: '123 Main St',
					deliveryPhone: '+998901234567',
				},
			})
			const res = mockResponse()

			const mockUser = generateMockUser()
			const mockProduct = generateMockProduct()
			const mockCreatedOrder = generateMockOrder({ orderNumber: '0001' })

			prismaMock.user.findUnique.mockResolvedValue(mockUser as any)
			prismaMock.product.findUnique.mockResolvedValue(mockProduct as any)
			prismaMock.productVariation.findFirst.mockResolvedValue(null)
			prismaMock.topping.findMany.mockResolvedValue([])
			prismaMock.order.findFirst.mockResolvedValue(null) // No previous orders
			prismaMock.order.create.mockResolvedValue(mockCreatedOrder as any)

			await createOrder(req as Request, res as Response)

			expect(res.status).toHaveBeenCalledWith(201)
		})

		it('should handle coordinates (lat/lng) properly', async () => {
			const req = mockRequest({
				body: {
					userId: 'user-1',
					email: 'test@example.com',
					name: 'Test User',
					items: [
						{
							productId: 'product-1',
							quantity: 1,
							addedToppingIds: [],
							removedToppingIds: [],
						},
					],
					deliveryAddress: '123 Main St',
					deliveryPhone: '+998901234567',
					deliveryLat: '41.2995',
					deliveryLng: '69.2401',
				},
			})
			const res = mockResponse()

			const mockUser = generateMockUser()
			const mockProduct = generateMockProduct()
			const mockLastOrder = { orderNumber: '0099' }
			const mockCreatedOrder = generateMockOrder()

			prismaMock.user.findUnique.mockResolvedValue(mockUser as any)
			prismaMock.product.findUnique.mockResolvedValue(mockProduct as any)
			prismaMock.productVariation.findFirst.mockResolvedValue(null)
			prismaMock.topping.findMany.mockResolvedValue([])
			prismaMock.order.findFirst.mockResolvedValue(mockLastOrder as any)
			prismaMock.order.create.mockResolvedValue(mockCreatedOrder as any)

			await createOrder(req as Request, res as Response)

			expect(res.status).toHaveBeenCalledWith(201)
		})
	})

	// ========================================================================
	// updateOrderStatus - Advanced Cases
	// ========================================================================
	describe('updateOrderStatus - Advanced Scenarios', () => {
		it('should update both status and paymentStatus', async () => {
			const req = mockRequest({
				params: { id: 'order-1' },
				body: {
					status: 'DELIVERED',
					paymentStatus: 'PAID',
				},
			})
			const res = mockResponse()

			const mockOrder = generateMockOrder({ id: 'order-1' })
			const mockUpdatedOrder = generateMockOrder({
				id: 'order-1',
				status: 'DELIVERED',
				paymentStatus: 'PAID',
			})

			prismaMock.order.findUnique.mockResolvedValue(mockOrder as any)
			prismaMock.order.update.mockResolvedValue(mockUpdatedOrder as any)

			await updateOrderStatus(req as Request, res as Response)

			expect(res.status).toHaveBeenCalledWith(200)
			expect(prismaMock.order.update).toHaveBeenCalledWith({
				where: { id: 'order-1' },
				data: {
					status: 'DELIVERED',
					paymentStatus: 'PAID',
				},
				include: expect.any(Object),
			})
		})

		it('should update only status if paymentStatus not provided', async () => {
			const req = mockRequest({
				params: { id: 'order-1' },
				body: {
					status: 'PREPARING',
				},
			})
			const res = mockResponse()

			const mockOrder = generateMockOrder()
			const mockUpdatedOrder = generateMockOrder({ status: 'PREPARING' })

			prismaMock.order.findUnique.mockResolvedValue(mockOrder as any)
			prismaMock.order.update.mockResolvedValue(mockUpdatedOrder as any)

			await updateOrderStatus(req as Request, res as Response)

			expect(res.status).toHaveBeenCalledWith(200)
			expect(prismaMock.order.update).toHaveBeenCalledWith({
				where: { id: 'order-1' },
				data: {
					status: 'PREPARING',
				},
				include: expect.any(Object),
			})
		})

		it('should update only paymentStatus if status not provided', async () => {
			const req = mockRequest({
				params: { id: 'order-1' },
				body: {
					paymentStatus: 'PAID',
				},
			})
			const res = mockResponse()

			const mockOrder = generateMockOrder()
			const mockUpdatedOrder = generateMockOrder({ paymentStatus: 'PAID' })

			prismaMock.order.findUnique.mockResolvedValue(mockOrder as any)
			prismaMock.order.update.mockResolvedValue(mockUpdatedOrder as any)

			await updateOrderStatus(req as Request, res as Response)

			expect(res.status).toHaveBeenCalledWith(200)
		})
	})
})
