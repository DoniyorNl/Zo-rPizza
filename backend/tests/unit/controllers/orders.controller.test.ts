// backend/tests/unit/controllers/orders.controller.test.ts
// 🍕 ORDERS CONTROLLER TESTS - COMPLETE COVERAGE
// Bu file Orders Controller'ning BARCHA funksiyalarini test qiladi

import {
	createOrder,
	deleteOrder,
	getAllOrders,
	getOrderById,
	getUserOrders,
	updateOrderStatus,
} from '@/controllers/orders.controller'
import { Request, Response } from 'express'
import { prismaMock } from '../../setup'

// ============================================
// MOCK DATA GENERATORS
// ============================================

/**
 * Mock User yaratish
 */
const generateMockUser = (overrides = {}) => ({
	id: 'user-1',
	email: 'test@example.com',
	name: 'Test User',
	phone: '+998901234567',
	password: 'hashed_password',
	role: 'CUSTOMER' as const,
	isBlocked: false,
	createdAt: new Date(),
	updatedAt: new Date(),
	...overrides,
})

/**
 * Mock Product yaratish
 */
const generateMockProduct = (overrides = {}) => ({
	id: 'product-1',
	name: 'Margherita Pizza',
	description: 'Classic pizza',
	imageUrl: 'https://example.com/pizza.jpg',
	basePrice: 45000,
	prepTime: 20,
	isActive: true,
	categoryId: 'cat-1',
	allergens: [],
	calories: 250,
	carbs: null,
	cookingSteps: null,
	cookingTemp: null,
	cookingTime: null,
	difficulty: null,
	fat: null,
	images: [],
	ingredients: null,
	protein: null,
	recipe: null,
	servings: null,
	createdAt: new Date(),
	updatedAt: new Date(),
	...overrides,
})

/**
 * Mock Order yaratish
 */
const generateMockOrder = (overrides = {}) => ({
	id: 'order-1',
	orderNumber: '0001',
	userId: 'user-1',
	totalPrice: 50000,
	status: 'PENDING' as const,
	paymentMethod: 'CASH' as const,
	paymentStatus: 'PENDING' as const,
	deliveryAddress: '123 Main St',
	deliveryPhone: '+998901234567',
	deliveryLat: null,
	deliveryLng: null,
	estimatedDeliveryTime: null,
	actualDeliveryTime: null,
	notes: null,
	createdAt: new Date(),
	updatedAt: new Date(),
	...overrides,
})

/**
 * Mock Order Item yaratish
 */
const generateMockOrderItem = (overrides = {}) => ({
	id: 'item-1',
	orderId: 'order-1',
	productId: 'product-1',
	variationId: null,
	size: 'MEDIUM',
	quantity: 1,
	price: 45000,
	createdAt: new Date(),
	updatedAt: new Date(),
	...overrides,
})

// ============================================
// MOCK REQUEST & RESPONSE
// ============================================

const mockRequest = (overrides = {}): Partial<Request> => ({
	params: {},
	query: {},
	body: {},
	...overrides,
})

const mockResponse = (): Partial<Response> => {
	const res: Partial<Response> = {
		status: jest.fn().mockReturnThis(),
		json: jest.fn().mockReturnThis(),
	}
	return res
}

// ============================================
// TEST SUITE: getAllOrders
// ============================================

describe('Orders Controller - getAllOrders', () => {
	/**
	 * TEST 1: Barcha orders'ni muvaffaqiyatli olish
	 *
	 * Scenario: Admin barcha buyurtmalarni ko'rmoqchi
	 * Expected: Barcha orders user va items bilan qaytadi
	 */
	it('should return all orders with user and items', async () => {
		const req = mockRequest()
		const res = mockResponse()

		const mockOrders = [
			{
				...generateMockOrder(),
				user: {
					name: 'Test User',
					email: 'test@example.com',
					phone: '+998901234567',
				},
				items: [
					{
						...generateMockOrderItem(),
						product: generateMockProduct(),
					},
				],
			},
		]

		prismaMock.order.findMany.mockResolvedValue(mockOrders as any)

		await getAllOrders(req as Request, res as Response)

		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith({
			success: true,
			count: 1,
			data: mockOrders,
		})
	})

	/**
	 * TEST 2: Status filter bilan orders olish
	 *
	 * Scenario: Admin faqat PENDING orders'ni ko'rmoqchi
	 * Expected: Faqat PENDING orders qaytadi
	 */
	it('should filter orders by status', async () => {
		const req = mockRequest({ query: { status: 'PENDING' } })
		const res = mockResponse()

		const mockPendingOrders = [
			{
				...generateMockOrder({ status: 'PENDING' }),
				user: { name: 'User 1', email: 'user1@test.com', phone: '123' },
				items: [],
			},
		]

		prismaMock.order.findMany.mockResolvedValue(mockPendingOrders as any)

		await getAllOrders(req as Request, res as Response)

		expect(prismaMock.order.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({
					status: 'PENDING',
				}),
			}),
		)
		expect(res.status).toHaveBeenCalledWith(200)
	})

	/**
	 * TEST 3: Payment status filter
	 *
	 * Scenario: Admin faqat to'langan orders'ni ko'rmoqchi
	 * Expected: Faqat PAID orders qaytadi
	 */
	it('should filter orders by paymentStatus', async () => {
		const req = mockRequest({ query: { paymentStatus: 'PAID' } })
		const res = mockResponse()

		prismaMock.order.findMany.mockResolvedValue([])

		await getAllOrders(req as Request, res as Response)

		expect(prismaMock.order.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({
					paymentStatus: 'PAID',
				}),
			}),
		)
	})

	/**
	 * TEST 4: Database error handling
	 *
	 * Scenario: Database connection failed
	 * Expected: 500 error qaytadi
	 */
	it('should handle database errors', async () => {
		const req = mockRequest()
		const res = mockResponse()

		prismaMock.order.findMany.mockRejectedValue(new Error('DB Error'))

		await getAllOrders(req as Request, res as Response)

		expect(res.status).toHaveBeenCalledWith(500)
		expect(res.json).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				message: 'Server error',
			}),
		)
	})
})

// ============================================
// TEST SUITE: getUserOrders
// ============================================

describe('Orders Controller - getUserOrders', () => {
	/**
	 * TEST 5: User orders'ni olish
	 *
	 * Scenario: User o'zining buyurtmalarini ko'rmoqchi
	 * Expected: Faqat shu user'ning orders'i qaytadi
	 */
	it('should return orders for specific user', async () => {
		const userId = 'user-1'
		const req = mockRequest({ params: { userId }, userId } as any)
		const res = mockResponse()

		const mockUser = generateMockUser({ id: userId, firebaseUid: userId })
		const mockUserOrders = [
			{
				...generateMockOrder({ userId }),
				items: [
					{
						...generateMockOrderItem(),
						product: generateMockProduct(),
					},
				],
			},
		]

		prismaMock.user.findFirst.mockResolvedValue(mockUser as any)
		prismaMock.order.findMany.mockResolvedValue(mockUserOrders as any)

		await getUserOrders(req as Request, res as Response)

		expect(prismaMock.order.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { userId },
			}),
		)
		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith({
			success: true,
			count: 1,
			data: mockUserOrders,
		})
	})

	/**
	 * TEST 6: Invalid userId
	 *
	 * Scenario: userId berilmagan
	 * Expected: 400 error
	 */
	it('should return 400 if userId is invalid', async () => {
		const req = mockRequest({ params: {} })
		const res = mockResponse()

		await getUserOrders(req as Request, res as Response)

		expect(res.status).toHaveBeenCalledWith(400)
		expect(res.json).toHaveBeenCalledWith({
			success: false,
			message: 'Invalid userId',
		})
	})

	/**
	 * TEST 7: User orders yo'q
	 *
	 * Scenario: User hali buyurtma qilmagan
	 * Expected: Bo'sh array qaytadi
	 */
	it('should return empty array if user has no orders', async () => {
		const req = mockRequest({ params: { userId: 'user-1' }, userId: 'user-1' } as any)
		const res = mockResponse()

		const mockUser = generateMockUser({ id: 'user-1', firebaseUid: 'user-1' })
		prismaMock.user.findFirst.mockResolvedValue(mockUser as any)
		prismaMock.order.findMany.mockResolvedValue([])

		await getUserOrders(req as Request, res as Response)

		expect(res.json).toHaveBeenCalledWith({
			success: true,
			count: 0,
			data: [],
		})
	})
})

// ============================================
// TEST SUITE: getOrderById
// ============================================

describe('Orders Controller - getOrderById', () => {
	/**
	 * TEST 8: Get order by ID successfully
	 *
	 * Scenario: User wants to view order details
	 * Expected: Returns complete order with all relations
	 */
	it('should return order by ID with all details', async () => {
		const orderId = 'order-1'
		const req = mockRequest({ params: { id: orderId } })
		const res = mockResponse()

		const mockOrder = {
			...generateMockOrder({ id: orderId }),
			user: {
				name: 'Test User',
				email: 'test@example.com',
				phone: '+998901234567',
			},
			items: [
				{
					...generateMockOrderItem(),
					product: {
						...generateMockProduct(),
						category: { id: 'cat-1', name: 'Pizza' },
					},
					toppings: [],
					halfHalf: null,
				},
			],
			reviews: [],
		}

		prismaMock.order.findUnique.mockResolvedValue(mockOrder as any)

		await getOrderById(req as Request, res as Response)

		expect(prismaMock.order.findUnique).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { id: orderId },
			}),
		)
		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith({
			success: true,
			data: mockOrder,
		})
	})

	/**
	 * TEST 9: Order not found
	 *
	 * Scenario: User tries to view non-existent order
	 * Expected: 404 error
	 */
	it('should return 404 if order not found', async () => {
		const req = mockRequest({ params: { id: 'order-999' } })
		const res = mockResponse()

		prismaMock.order.findUnique.mockResolvedValue(null)

		await getOrderById(req as Request, res as Response)

		expect(res.status).toHaveBeenCalledWith(404)
		expect(res.json).toHaveBeenCalledWith({
			success: false,
			message: 'Order not found',
		})
	})

	/**
	 * TEST 10: Invalid order ID
	 *
	 * Scenario: No ID provided
	 * Expected: 400 error
	 */
	it('should return 400 if id is invalid', async () => {
		const req = mockRequest({ params: {} })
		const res = mockResponse()

		await getOrderById(req as Request, res as Response)

		expect(res.status).toHaveBeenCalledWith(400)
		expect(res.json).toHaveBeenCalledWith({
			success: false,
			message: 'Invalid id',
		})
	})
})

// ============================================
// TEST SUITE: createOrder
// ============================================

describe('Orders Controller - createOrder', () => {
	/**
	 * TEST 11: Create order successfully
	 *
	 * Scenario: User places a valid order
	 * Expected: Order created with correct pricing
	 */
	it('should create order with valid data', async () => {
		const req = mockRequest({
			body: {
				userId: 'user-1',
				items: [
					{
						productId: 'product-1',
						quantity: 2,
					},
				],
				deliveryAddress: '123 Main St',
				deliveryPhone: '+998901234567',
				paymentMethod: 'CASH',
			},
		})
		const res = mockResponse()

		const mockUser = generateMockUser()
		const mockProduct = generateMockProduct()
		const mockOrder = generateMockOrder()

		prismaMock.user.findUnique.mockResolvedValue(mockUser as any)
		prismaMock.product.findUnique.mockResolvedValue(mockProduct as any)
		prismaMock.order.findFirst.mockResolvedValue(null)
		prismaMock.order.create.mockResolvedValue(mockOrder as any)

		await createOrder(req as Request, res as Response)

		expect(prismaMock.user.findUnique).toHaveBeenCalled()
		expect(prismaMock.product.findUnique).toHaveBeenCalled()
		expect(prismaMock.order.create).toHaveBeenCalled()
		expect(res.status).toHaveBeenCalledWith(201)
		expect(res.json).toHaveBeenCalledWith(
			expect.objectContaining({
				success: true,
				message: 'Order created successfully',
			}),
		)
	})

	/**
	 * TEST 12: Missing required fields
	 *
	 * Scenario: Required fields not provided
	 * Expected: 400 error
	 */
	it('should return 400 if required fields missing', async () => {
		const req = mockRequest({
			body: {
				userId: 'user-1',
				items: [], // Empty items array
				deliveryAddress: '123 Main St',
				// Missing deliveryPhone
			},
		})
		const res = mockResponse()

		await createOrder(req as Request, res as Response)

		expect(res.status).toHaveBeenCalledWith(400)
		expect(res.json).toHaveBeenCalledWith({
			success: false,
			message: 'Missing required fields',
		})
	})

	/**
	 * TEST 13: User auto-creation
	 *
	 * Scenario: Order for non-existent user (auto-creates user)
	 * Expected: User created and order processed
	 */
	it('should auto-create user if not found', async () => {
		const req = mockRequest({
			body: {
				userId: 'user-999',
				email: 'newuser@test.com',
				items: [{ productId: 'product-1', quantity: 1, variationId: 'var-1' }],
				deliveryAddress: '123 Main St',
				deliveryPhone: '+998901234567',
			},
		})
		const res = mockResponse()

		const newUser = generateMockUser({ id: 'user-999', firebaseUid: 'user-999' })
		const product = generateMockProduct({ id: 'product-1', basePrice: 100 })
		const variation = { id: 'var-1', price: 120, size: 'Medium' }

		prismaMock.user.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(null)
		prismaMock.user.create.mockResolvedValue(newUser as any)
		prismaMock.product.findUnique.mockResolvedValue({ ...product, variations: [variation] } as any)
		prismaMock.productVariation.findFirst.mockResolvedValue(variation as any)
		prismaMock.order.findFirst.mockResolvedValue(null)
		prismaMock.order.create.mockResolvedValue(generateMockOrder() as any)

		await createOrder(req as Request, res as Response)

		expect(prismaMock.user.create).toHaveBeenCalled()
		expect(res.status).toHaveBeenCalledWith(201)
	})

	/**
	 * TEST 14: Product not found
	 *
	 * Scenario: Order contains non-existent product
	 * Expected: 404 error
	 */
	it('should return 404 if product not found', async () => {
		const req = mockRequest({
			body: {
				userId: 'user-1',
				items: [{ productId: 'product-999', quantity: 1 }],
				deliveryAddress: '123 Main St',
				deliveryPhone: '+998901234567',
			},
		})
		const res = mockResponse()

		const mockUser = generateMockUser()

		prismaMock.user.findUnique.mockResolvedValue(mockUser as any)
		prismaMock.product.findUnique.mockResolvedValue(null)

		await createOrder(req as Request, res as Response)

		expect(res.status).toHaveBeenCalledWith(404)
		expect(res.json).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				message: expect.stringContaining('not found'),
			}),
		)
	})

	/**
	 * TEST 15: Inactive product
	 *
	 * Scenario: Order contains inactive product
	 * Expected: 400 error
	 */
	it('should return 400 if product is not active', async () => {
		const req = mockRequest({
			body: {
				userId: 'user-1',
				items: [{ productId: 'product-1', quantity: 1 }],
				deliveryAddress: '123 Main St',
				deliveryPhone: '+998901234567',
			},
		})
		const res = mockResponse()

		const mockUser = generateMockUser()
		const inactiveProduct = generateMockProduct({ isActive: false })

		prismaMock.user.findUnique.mockResolvedValue(mockUser as any)
		prismaMock.product.findUnique.mockResolvedValue(inactiveProduct as any)

		await createOrder(req as Request, res as Response)

		expect(res.status).toHaveBeenCalledWith(400)
		expect(res.json).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				message: expect.stringContaining('not available'),
			}),
		)
	})
})

// ============================================
// TEST SUITE: updateOrderStatus
// ============================================

describe('Orders Controller - updateOrderStatus', () => {
	/**
	 * TEST 16: Update order status successfully
	 *
	 * Scenario: Admin updates order to DELIVERED
	 * Expected: Status updated successfully
	 */
	it('should update order status', async () => {
		const orderId = 'order-1'
		const req = mockRequest({
			params: { id: orderId },
			body: { status: 'DELIVERED', paymentStatus: 'PAID' },
		})
		const res = mockResponse()

		const existingOrder = generateMockOrder({ id: orderId })
		const updatedOrder = {
			...existingOrder,
			status: 'DELIVERED',
			paymentStatus: 'PAID',
		}

		prismaMock.order.findUnique.mockResolvedValue(existingOrder as any)
		prismaMock.order.update.mockResolvedValue(updatedOrder as any)

		await updateOrderStatus(req as Request, res as Response)

		expect(prismaMock.order.update).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { id: orderId },
				data: expect.objectContaining({
					status: 'DELIVERED',
					paymentStatus: 'PAID',
				}),
			}),
		)
		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith({
			success: true,
			message: 'Order status updated',
			data: updatedOrder,
		})
	})

	/**
	 * TEST 17: Order not found for update
	 *
	 * Scenario: Trying to update non-existent order
	 * Expected: 404 error
	 */
	it('should return 404 if order not found', async () => {
		const req = mockRequest({
			params: { id: 'order-999' },
			body: { status: 'DELIVERED' },
		})
		const res = mockResponse()

		prismaMock.order.findUnique.mockResolvedValue(null)

		await updateOrderStatus(req as Request, res as Response)

		expect(res.status).toHaveBeenCalledWith(404)
		expect(res.json).toHaveBeenCalledWith({
			success: false,
			message: 'Order not found',
		})
	})

	/**
	 * TEST 18: Invalid order ID for update
	 *
	 * Scenario: No ID provided
	 * Expected: 400 error
	 */
	it('should return 400 if id is invalid', async () => {
		const req = mockRequest({
			params: {},
			body: { status: 'DELIVERED' },
		})
		const res = mockResponse()

		await updateOrderStatus(req as Request, res as Response)

		expect(res.status).toHaveBeenCalledWith(400)
	})
})

// ============================================
// TEST SUITE: deleteOrder
// ============================================

describe('Orders Controller - deleteOrder', () => {
	/**
	 * TEST 19: Delete pending order successfully
	 *
	 * Scenario: Admin deletes a PENDING order
	 * Expected: Order deleted successfully
	 */
	it('should delete pending order', async () => {
		const orderId = 'order-1'
		const req = mockRequest({ params: { id: orderId }, userId: 'user-1' } as any)
		const res = mockResponse()

		const mockUser = generateMockUser({ id: 'user-1', firebaseUid: 'user-1' })
		const pendingOrder = generateMockOrder({ id: orderId, status: 'PENDING', userId: 'user-1' })

		prismaMock.user.findFirst.mockResolvedValue(mockUser as any)
		prismaMock.order.findUnique.mockResolvedValue(pendingOrder as any)
		prismaMock.order.delete.mockResolvedValue(pendingOrder as any)

		await deleteOrder(req as Request, res as Response)

		expect(prismaMock.order.delete).toHaveBeenCalledWith({
			where: { id: orderId },
		})
		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith({
			success: true,
			message: 'Order deleted successfully',
		})
	})

	/**
	 * TEST 20: Cannot delete non-pending order
	 *
	 * Scenario: Trying to delete DELIVERED order
	 * Expected: 400 error
	 */
	it('should not delete non-pending order', async () => {
		const orderId = 'order-1'
		const req = mockRequest({ params: { id: orderId }, userId: 'user-1' } as any)
		const res = mockResponse()

		const mockUser = generateMockUser({ id: 'user-1', firebaseUid: 'user-1' })
		const deliveredOrder = generateMockOrder({
			id: orderId,
			status: 'DELIVERED',
			userId: 'user-1',
		})

		prismaMock.user.findFirst.mockResolvedValue(mockUser as any)
		prismaMock.order.findUnique.mockResolvedValue(deliveredOrder as any)

		await deleteOrder(req as Request, res as Response)

		expect(prismaMock.order.delete).not.toHaveBeenCalled()
		expect(res.status).toHaveBeenCalledWith(400)
		expect(res.json).toHaveBeenCalledWith({
			success: false,
			message: 'Can only delete pending orders',
		})
	})

	/**
	 * TEST 21: Order not found for deletion
	 *
	 * Scenario: Trying to delete non-existent order
	 * Expected: 404 error
	 */
	it('should return 404 if order not found', async () => {
		const req = mockRequest({ params: { id: 'order-999' }, userId: 'user-1' } as any)
		const res = mockResponse()

		const mockUser = generateMockUser({ id: 'user-1', firebaseUid: 'user-1' })
		prismaMock.user.findFirst.mockResolvedValue(mockUser as any)
		prismaMock.order.findUnique.mockResolvedValue(null)

		await deleteOrder(req as Request, res as Response)

		expect(res.status).toHaveBeenCalledWith(404)
		expect(res.json).toHaveBeenCalledWith({
			success: false,
			message: 'Order not found',
		})
	})

	/**
	 * TEST 22: Invalid order ID for deletion
	 *
	 * Scenario: No ID provided
	 * Expected: 400 error
	 */
	it('should return 400 if id is invalid', async () => {
		const req = mockRequest({ params: {} })
		const res = mockResponse()

		await deleteOrder(req as Request, res as Response)

		expect(res.status).toHaveBeenCalledWith(400)
	})
})

// DAVOM ETADI... (Next part: getOrderById, createOrder, updateOrderStatus, deleteOrder tests)
