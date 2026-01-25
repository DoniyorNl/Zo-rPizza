// backend/tests/unit/controllers/dashboard.controller.test.ts
// 📊 DASHBOARD CONTROLLER TESTS - Senior Level Best Practices

import { Request, Response } from 'express'
import { DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended'
import prisma from '../../../src/lib/prisma'
import { getDashboardData } from '../../../src/controllers/dashboard.controller'

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
	query: {},
	params: {},
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

// Mock data generators
const generateMockOrder = (overrides: any = {}) => {
	const baseOrder = {
		id: 'order-1',
		orderNumber: '2026-001',
		userId: 'user-1',
		totalPrice: 50000,
		status: 'PENDING' as const,
		paymentStatus: 'PAID' as const,
		estimatedTime: 30,
		createdAt: new Date(),
		updatedAt: new Date(),
		items: [],
		user: { name: 'John Doe', email: 'john@example.com' },
	}
	return { ...baseOrder, ...overrides }
}

const generateMockOrderItem = (overrides: any = {}) => ({
	id: 'item-1',
	orderId: 'order-1',
	productId: 'product-1',
	quantity: 2,
	price: 25000,
	product: {
		name: 'Pepperoni Pizza',
		images: ['https://example.com/pizza.jpg'],
		image: 'https://example.com/pizza.jpg',
		category: {
			id: 'cat-1',
			name: 'Pizza',
		},
	},
	...overrides,
})

// ============================================================================
// TESTS
// ============================================================================

describe('Dashboard Controller', () => {
	beforeEach(() => {
		mockReset(prismaMock)
		jest.clearAllMocks()
		// Clear console mocks
		jest.spyOn(console, 'log').mockImplementation()
		jest.spyOn(console, 'error').mockImplementation()
	})

	afterEach(() => {
		jest.restoreAllMocks()
	})

	describe('getDashboardData', () => {
		it('should return complete dashboard data with all statistics', async () => {
			// Arrange
			const req = mockRequest()
			const res = mockResponse()

			const today = new Date()
			today.setHours(0, 0, 0, 0)

			const todayOrders = [
				{
					...generateMockOrder({
						id: 'order-1',
						totalPrice: 50000,
						createdAt: today,
						items: [generateMockOrderItem({ quantity: 2, price: 25000 })],
					}),
				},
				{
					...generateMockOrder({
						id: 'order-2',
						totalPrice: 75000,
						createdAt: today,
						items: [generateMockOrderItem({ quantity: 3, price: 25000 })],
					}),
				},
			]

			const yesterdayOrders = [
				{ totalPrice: 40000 },
				{ totalPrice: 35000 },
			]

			const liveOrders = [
				{
					...generateMockOrder({
						id: 'live-1',
						status: 'PENDING',
						orderNumber: '2026-100',
					}),
				},
			]

			// Mock all database calls
			prismaMock.order.findMany
				.mockResolvedValueOnce(todayOrders as any) // Today's orders with items
				.mockResolvedValueOnce(yesterdayOrders as any) // Yesterday's orders
				.mockResolvedValueOnce(liveOrders as any) // Live orders

			prismaMock.order.count.mockResolvedValue(5) // Active orders count

			// Act
			await getDashboardData(req as Request, res as Response)

			// Assert
			expect(res.status).toHaveBeenCalledWith(200)
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					data: expect.objectContaining({
						stats: expect.objectContaining({
							todayRevenue: 125000, // 50k + 75k
							todayOrders: 2,
							activeOrders: 5,
							averageOrderValue: 62500, // 125k / 2
						}),
						liveOrders: expect.any(Array),
						topProductsToday: expect.any(Array),
						hourlyRevenue: expect.any(Array),
					}),
					timestamp: expect.any(String),
				}),
			)
		})

		it('should calculate revenue change percentage correctly', async () => {
			// Arrange
			const req = mockRequest()
			const res = mockResponse()

			const today = new Date()
			today.setHours(0, 0, 0, 0)

			// Today: 150k revenue
			const todayOrders = [
				generateMockOrder({ totalPrice: 150000, createdAt: today, items: [] }),
			]

			// Yesterday: 100k revenue
			const yesterdayOrders = [{ totalPrice: 100000 }]

			prismaMock.order.findMany
				.mockResolvedValueOnce(todayOrders as any)
				.mockResolvedValueOnce(yesterdayOrders as any)
				.mockResolvedValueOnce([])

			prismaMock.order.count.mockResolvedValue(0)

			// Act
			await getDashboardData(req as Request, res as Response)

			// Assert
			const responseData = (res.json as jest.Mock).mock.calls[0][0].data
			// Expected: (150k - 100k) / 100k * 100 = 50%
			expect(responseData.stats.revenueChange).toBeCloseTo(50, 0)
		})

		it('should calculate orders change percentage correctly', async () => {
			// Arrange
			const req = mockRequest()
			const res = mockResponse()

			const today = new Date()
			today.setHours(0, 0, 0, 0)

			// Today: 6 orders
			const todayOrders = Array(6)
				.fill(null)
				.map((_, i) =>
					generateMockOrder({
						id: `order-${i}`,
						totalPrice: 50000,
						createdAt: today,
						items: [],
					}),
				)

			// Yesterday: 4 orders
			const yesterdayOrders = Array(4)
				.fill(null)
				.map(() => ({ totalPrice: 50000 }))

			prismaMock.order.findMany
				.mockResolvedValueOnce(todayOrders as any)
				.mockResolvedValueOnce(yesterdayOrders as any)
				.mockResolvedValueOnce([])

			prismaMock.order.count.mockResolvedValue(0)

			// Act
			await getDashboardData(req as Request, res as Response)

			// Assert
			const responseData = (res.json as jest.Mock).mock.calls[0][0].data
			// Expected: (6 - 4) / 4 * 100 = 50%
			expect(responseData.stats.ordersChange).toBeCloseTo(50, 0)
		})

		it('should handle zero revenue gracefully', async () => {
			// Arrange
			const req = mockRequest()
			const res = mockResponse()

			prismaMock.order.findMany
				.mockResolvedValueOnce([]) // No today orders
				.mockResolvedValueOnce([]) // No yesterday orders
				.mockResolvedValueOnce([]) // No live orders

			prismaMock.order.count.mockResolvedValue(0)

			// Act
			await getDashboardData(req as Request, res as Response)

			// Assert
			expect(res.status).toHaveBeenCalledWith(200)
			const responseData = (res.json as jest.Mock).mock.calls[0][0].data
			expect(responseData.stats.todayRevenue).toBe(0)
			expect(responseData.stats.todayOrders).toBe(0)
			expect(responseData.stats.averageOrderValue).toBe(0)
		})

		it('should format live orders correctly', async () => {
			// Arrange
			const req = mockRequest()
			const res = mockResponse()

			const today = new Date()
			today.setHours(0, 0, 0, 0)

			const liveOrders = [
				{
					...generateMockOrder({
						id: 'live-1',
						orderNumber: '2026-100',
						status: 'PENDING',
						totalPrice: 50000,
						estimatedTime: 30,
						createdAt: today,
						user: { name: 'Alice' },
						items: [
							{
								quantity: 2,
								product: { name: 'Pepperoni Pizza' },
							},
							{
								quantity: 1,
								product: { name: 'Coca Cola' },
							},
						],
					}),
				},
			]

			prismaMock.order.findMany
				.mockResolvedValueOnce([]) // Today orders
				.mockResolvedValueOnce([]) // Yesterday orders
				.mockResolvedValueOnce(liveOrders as any) // Live orders

			prismaMock.order.count.mockResolvedValue(1)

			// Act
			await getDashboardData(req as Request, res as Response)

			// Assert
			const responseData = (res.json as jest.Mock).mock.calls[0][0].data
			expect(responseData.liveOrders).toHaveLength(1)
			expect(responseData.liveOrders[0]).toMatchObject({
				id: 'live-1',
				orderNumber: '2026-100',
				customerName: 'Alice',
				items: ['Pepperoni Pizza x2', 'Coca Cola x1'],
				total: 50000,
				status: 'PENDING',
			})
		})

		it('should handle orders without user (guest orders)', async () => {
			// Arrange
			const req = mockRequest()
			const res = mockResponse()

			const liveOrders = [
				{
					...generateMockOrder({
						id: 'live-1',
						orderNumber: '2026-100',
						status: 'PENDING',
						user: null, // Guest order
						items: [],
					}),
				},
			]

			prismaMock.order.findMany
				.mockResolvedValueOnce([])
				.mockResolvedValueOnce([])
				.mockResolvedValueOnce(liveOrders as any)

			prismaMock.order.count.mockResolvedValue(0)

			// Act
			await getDashboardData(req as Request, res as Response)

			// Assert
			const responseData = (res.json as jest.Mock).mock.calls[0][0].data
			expect(responseData.liveOrders[0].customerName).toBe('Mehmon')
		})

		it('should calculate top products correctly', async () => {
			// Arrange
			const req = mockRequest()
			const res = mockResponse()

			const today = new Date()
			today.setHours(0, 0, 0, 0)

			const todayOrders = [
				{
					...generateMockOrder({
						totalPrice: 100000,
						createdAt: today,
						items: [
							generateMockOrderItem({
								productId: 'product-1',
								quantity: 3,
								price: 25000,
								product: {
									name: 'Pepperoni Pizza',
									image: 'pizza.jpg',
									category: { name: 'Pizza' },
								},
							}),
							generateMockOrderItem({
								productId: 'product-2',
								quantity: 1,
								price: 25000,
								product: {
									name: 'Margherita Pizza',
									image: 'margherita.jpg',
									category: { name: 'Pizza' },
								},
							}),
						],
					}),
				},
			]

			prismaMock.order.findMany
				.mockResolvedValueOnce(todayOrders as any)
				.mockResolvedValueOnce([])
				.mockResolvedValueOnce([])

			prismaMock.order.count.mockResolvedValue(0)

			// Act
			await getDashboardData(req as Request, res as Response)

			// Assert
			const responseData = (res.json as jest.Mock).mock.calls[0][0].data
			expect(responseData.topProductsToday).toHaveLength(2)
			// First product should have higher revenue
			expect(responseData.topProductsToday[0]).toMatchObject({
				id: 'product-1',
				name: 'Pepperoni Pizza',
				soldToday: 3,
				revenueToday: 75000,
			})
		})

		it('should calculate hourly revenue correctly', async () => {
			// Arrange
			const req = mockRequest()
			const res = mockResponse()

			const today = new Date()
			today.setHours(0, 0, 0, 0)

			const order10AM = new Date(today)
			order10AM.setHours(10, 0, 0, 0)

			const order2PM = new Date(today)
			order2PM.setHours(14, 0, 0, 0)

			const todayOrders = [
				generateMockOrder({ totalPrice: 50000, createdAt: order10AM, items: [] }),
				generateMockOrder({ totalPrice: 75000, createdAt: order2PM, items: [] }),
				generateMockOrder({ totalPrice: 25000, createdAt: order2PM, items: [] }),
			]

			prismaMock.order.findMany
				.mockResolvedValueOnce(todayOrders as any)
				.mockResolvedValueOnce([])
				.mockResolvedValueOnce([])

			prismaMock.order.count.mockResolvedValue(0)

			// Act
			await getDashboardData(req as Request, res as Response)

			// Assert
			const responseData = (res.json as jest.Mock).mock.calls[0][0].data
			expect(responseData.hourlyRevenue).toHaveLength(24)
			expect(responseData.hourlyRevenue[10]).toMatchObject({
				hour: 10,
				revenue: 50000,
				orders: 1,
			})
			expect(responseData.hourlyRevenue[14]).toMatchObject({
				hour: 14,
				revenue: 100000, // 75k + 25k
				orders: 2,
			})
		})

		it('should handle multiple active order statuses', async () => {
			// Arrange
			const req = mockRequest()
			const res = mockResponse()

			prismaMock.order.findMany
				.mockResolvedValueOnce([])
				.mockResolvedValueOnce([])
				.mockResolvedValueOnce([])

			prismaMock.order.count.mockResolvedValue(15) // Active orders

			// Act
			await getDashboardData(req as Request, res as Response)

			// Assert
			expect(prismaMock.order.count).toHaveBeenCalledWith({
				where: {
					status: {
						in: ['PENDING', 'PREPARING', 'READY', 'DELIVERING'],
					},
				},
			})
			const responseData = (res.json as jest.Mock).mock.calls[0][0].data
			expect(responseData.stats.activeOrders).toBe(15)
		})

		it('should handle 100% increase when yesterday had zero orders', async () => {
			// Arrange
			const req = mockRequest()
			const res = mockResponse()

			const today = new Date()
			today.setHours(0, 0, 0, 0)

			const todayOrders = [
				generateMockOrder({ totalPrice: 50000, createdAt: today, items: [] }),
			]

			prismaMock.order.findMany
				.mockResolvedValueOnce(todayOrders as any)
				.mockResolvedValueOnce([]) // Zero yesterday orders
				.mockResolvedValueOnce([])

			prismaMock.order.count.mockResolvedValue(0)

			// Act
			await getDashboardData(req as Request, res as Response)

			// Assert
			const responseData = (res.json as jest.Mock).mock.calls[0][0].data
			expect(responseData.stats.revenueChange).toBe(100)
			expect(responseData.stats.ordersChange).toBe(100)
		})

		it('should limit live orders to 10', async () => {
			// Arrange
			const req = mockRequest()
			const res = mockResponse()

			prismaMock.order.findMany
				.mockResolvedValueOnce([])
				.mockResolvedValueOnce([])
				.mockResolvedValueOnce([])

			prismaMock.order.count.mockResolvedValue(0)

			// Act
			await getDashboardData(req as Request, res as Response)

			// Assert
			expect(prismaMock.order.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					take: 10,
					where: expect.objectContaining({
						status: expect.objectContaining({
							in: ['PENDING', 'PREPARING', 'READY', 'DELIVERING'],
						}),
					}),
				}),
			)
		})

		it('should handle database errors gracefully', async () => {
			// Arrange
			const req = mockRequest()
			const res = mockResponse()

			prismaMock.order.findMany.mockRejectedValue(new Error('Database connection failed'))

			// Act
			await getDashboardData(req as Request, res as Response)

			// Assert
			expect(res.status).toHaveBeenCalledWith(500)
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: false,
					message: "Dashboard ma'lumotlarini olishda xatolik",
					error: 'Database connection failed',
				}),
			)
		})

		it('should include timestamp in response', async () => {
			// Arrange
			const req = mockRequest()
			const res = mockResponse()

			prismaMock.order.findMany
				.mockResolvedValueOnce([])
				.mockResolvedValueOnce([])
				.mockResolvedValueOnce([])

			prismaMock.order.count.mockResolvedValue(0)

			// Act
			await getDashboardData(req as Request, res as Response)

			// Assert
			const responseData = (res.json as jest.Mock).mock.calls[0][0]
			expect(responseData).toHaveProperty('timestamp')
			expect(new Date(responseData.timestamp)).toBeInstanceOf(Date)
		})

		it('should sort top products by revenue in descending order', async () => {
			// Arrange
			const req = mockRequest()
			const res = mockResponse()

			const today = new Date()
			today.setHours(0, 0, 0, 0)

			const todayOrders = [
				{
					...generateMockOrder({
						createdAt: today,
						items: [
							generateMockOrderItem({
								productId: 'product-1',
								quantity: 2,
								price: 25000, // Revenue: 50k
								product: { name: 'Product A', image: 'a.jpg', category: { name: 'Cat A' } },
							}),
							generateMockOrderItem({
								productId: 'product-2',
								quantity: 5,
								price: 30000, // Revenue: 150k (highest)
								product: { name: 'Product B', image: 'b.jpg', category: { name: 'Cat B' } },
							}),
							generateMockOrderItem({
								productId: 'product-3',
								quantity: 3,
								price: 20000, // Revenue: 60k
								product: { name: 'Product C', image: 'c.jpg', category: { name: 'Cat C' } },
							}),
						],
					}),
				},
			]

			prismaMock.order.findMany
				.mockResolvedValueOnce(todayOrders as any)
				.mockResolvedValueOnce([])
				.mockResolvedValueOnce([])

			prismaMock.order.count.mockResolvedValue(0)

			// Act
			await getDashboardData(req as Request, res as Response)

			// Assert
			const responseData = (res.json as jest.Mock).mock.calls[0][0].data
			expect(responseData.topProductsToday[0].id).toBe('product-2') // Highest revenue
			expect(responseData.topProductsToday[0].revenueToday).toBe(150000)
			expect(responseData.topProductsToday[1].revenueToday).toBe(60000)
			expect(responseData.topProductsToday[2].revenueToday).toBe(50000)
		})
	})
})
