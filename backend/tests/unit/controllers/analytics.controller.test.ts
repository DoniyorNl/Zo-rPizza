// backend/tests/unit/controllers/analytics.controller.test.ts
// 📊 ANALYTICS CONTROLLER TESTS - Senior Level Best Practices

import { Request, Response } from 'express'
import { DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended'
import prisma from '../../../src/lib/prisma'
import {
	getOverview,
	getRevenueData,
	getTopProducts,
	getCategoryStats,
	getRecentOrders,
} from '../../../src/controllers/analytics.controller'

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
const generateMockOrder = (overrides: any = {}) => ({
	id: 'order-1',
	orderNumber: '2026-001',
	userId: 'user-1',
	totalPrice: 50000,
	status: 'DELIVERED' as const,
	paymentStatus: 'PAID' as const,
	createdAt: new Date('2026-01-25'),
	updatedAt: new Date('2026-01-25'),
	...overrides,
})

const generateMockProduct = (overrides: any = {}) => ({
	id: 'product-1',
	name: 'Pepperoni Pizza',
	categoryId: 'category-1',
	imageUrl: 'https://example.com/pizza.jpg',
	isActive: true,
	createdAt: new Date(),
	updatedAt: new Date(),
	category: {
		id: 'category-1',
		name: 'Pizza',
		description: 'Delicious pizzas',
		imageUrl: 'https://example.com/category.jpg',
		isActive: true,
		displayOrder: 1,
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	...overrides,
})

// ============================================================================
// TESTS
// ============================================================================

describe('Analytics Controller', () => {
	beforeEach(() => {
		mockReset(prismaMock)
		jest.clearAllMocks()
	})

	// ========================================================================
	// getOverview Tests
	// ========================================================================
	describe('getOverview', () => {
		it('should return analytics overview with default date range (30 days)', async () => {
			// Arrange
			const req = mockRequest({ query: {} })
			const res = mockResponse()

			prismaMock.order.count.mockResolvedValueOnce(100) // totalOrders
			prismaMock.order.aggregate.mockResolvedValueOnce({
				_sum: { totalPrice: 5000000 },
			} as any)
			prismaMock.user.count.mockResolvedValueOnce(50) // totalCustomers
			prismaMock.product.count.mockResolvedValueOnce(25) // activeProducts
			prismaMock.order.count.mockResolvedValueOnce(10) // pendingOrders
			prismaMock.order.count.mockResolvedValueOnce(85) // completedOrders
			prismaMock.order.count.mockResolvedValueOnce(5) // cancelledOrders

			// Act
			await getOverview(req as Request, res as Response)

			// Assert
			expect(res.status).toHaveBeenCalledWith(200)
			expect(res.json).toHaveBeenCalledWith({
				success: true,
				data: {
					totalRevenue: 5000000,
					totalOrders: 100,
					totalCustomers: 50,
					activeProducts: 25,
					averageOrderValue: 50000,
					pendingOrders: 10,
					completedOrders: 85,
					cancelledOrders: 5,
				},
			})
		})

		it('should return analytics with custom date range', async () => {
			// Arrange
			const req = mockRequest({
				query: {
					startDate: '2026-01-01',
					endDate: '2026-01-31',
				},
			})
			const res = mockResponse()

			prismaMock.order.count.mockResolvedValue(50)
			prismaMock.order.aggregate.mockResolvedValue({
				_sum: { totalPrice: 2500000 },
			} as any)
			prismaMock.user.count.mockResolvedValue(25)
			prismaMock.product.count.mockResolvedValue(15)

			// Act
			await getOverview(req as Request, res as Response)

			// Assert
			expect(res.status).toHaveBeenCalledWith(200)
			expect(prismaMock.order.count).toHaveBeenCalledWith(
				expect.objectContaining({
					where: expect.objectContaining({
						createdAt: expect.objectContaining({
							gte: expect.any(Date),
							lte: expect.any(Date),
						}),
					}),
				}),
			)
		})

		it('should return 400 if startDate is invalid', async () => {
			// Arrange
			const req = mockRequest({
				query: { startDate: 'invalid-date' },
			})
			const res = mockResponse()

			// Act
			await getOverview(req as Request, res as Response)

			// Assert
			expect(res.status).toHaveBeenCalledWith(400)
			expect(res.json).toHaveBeenCalledWith({
				success: false,
				message: 'Invalid startDate or endDate',
			})
		})

		it('should return 400 if startDate is after endDate', async () => {
			// Arrange
			const req = mockRequest({
				query: {
					startDate: '2026-01-31',
					endDate: '2026-01-01',
				},
			})
			const res = mockResponse()

			// Act
			await getOverview(req as Request, res as Response)

			// Assert
			expect(res.status).toHaveBeenCalledWith(400)
			expect(res.json).toHaveBeenCalledWith({
				success: false,
				message: 'startDate must be before endDate',
			})
		})

		it('should handle zero revenue (no completed orders)', async () => {
			// Arrange
			const req = mockRequest({ query: {} })
			const res = mockResponse()

			prismaMock.order.count.mockResolvedValue(0)
			prismaMock.order.aggregate.mockResolvedValue({
				_sum: { totalPrice: null },
			} as any)
			prismaMock.user.count.mockResolvedValue(0)
			prismaMock.product.count.mockResolvedValue(10)

			// Act
			await getOverview(req as Request, res as Response)

			// Assert
			expect(res.status).toHaveBeenCalledWith(200)
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					data: expect.objectContaining({
						totalRevenue: 0,
						averageOrderValue: 0,
					}),
				}),
			)
		})

		it('should handle database errors', async () => {
			// Arrange
			const req = mockRequest({ query: {} })
			const res = mockResponse()

			prismaMock.order.count.mockRejectedValue(new Error('Database connection failed'))

			// Act
			await getOverview(req as Request, res as Response)

			// Assert
			expect(res.status).toHaveBeenCalledWith(500)
			expect(res.json).toHaveBeenCalledWith({
				success: false,
				message: 'Server error',
			})
		})
	})

	// ========================================================================
	// getRevenueData Tests
	// ========================================================================
	describe('getRevenueData', () => {
		it('should return revenue data grouped by date', async () => {
			// Arrange
			const req = mockRequest({ query: {} })
			const res = mockResponse()

			const mockOrders = [
				{ totalPrice: 50000, createdAt: new Date('2026-01-25T10:00:00') },
				{ totalPrice: 75000, createdAt: new Date('2026-01-25T14:00:00') },
				{ totalPrice: 60000, createdAt: new Date('2026-01-26T11:00:00') },
			]

			prismaMock.order.findMany.mockResolvedValue(mockOrders as any)

			// Act
			await getRevenueData(req as Request, res as Response)

			// Assert
			expect(res.status).toHaveBeenCalledWith(200)
			expect(res.json).toHaveBeenCalledWith({
				success: true,
				data: expect.arrayContaining([
					expect.objectContaining({
						date: '2026-01-25',
						revenue: 125000,
						orders: 2,
					}),
					expect.objectContaining({
						date: '2026-01-26',
						revenue: 60000,
						orders: 1,
					}),
				]),
			})
		})

		it('should return empty array if no orders', async () => {
			// Arrange
			const req = mockRequest({ query: {} })
			const res = mockResponse()

			prismaMock.order.findMany.mockResolvedValue([])

			// Act
			await getRevenueData(req as Request, res as Response)

			// Assert
			expect(res.status).toHaveBeenCalledWith(200)
			expect(res.json).toHaveBeenCalledWith({
				success: true,
				data: [],
			})
		})

		it('should return 400 for invalid date range', async () => {
			// Arrange
			const req = mockRequest({
				query: { startDate: 'invalid' },
			})
			const res = mockResponse()

			// Act
			await getRevenueData(req as Request, res as Response)

			// Assert
			expect(res.status).toHaveBeenCalledWith(400)
			expect(res.json).toHaveBeenCalledWith({
				success: false,
				message: 'Invalid startDate or endDate',
			})
		})

		it('should handle database errors', async () => {
			// Arrange
			const req = mockRequest({ query: {} })
			const res = mockResponse()

			prismaMock.order.findMany.mockRejectedValue(new Error('Database error'))

			// Act
			await getRevenueData(req as Request, res as Response)

			// Assert
			expect(res.status).toHaveBeenCalledWith(500)
			expect(res.json).toHaveBeenCalledWith({
				success: false,
				message: 'Server error',
			})
		})
	})

	// ========================================================================
	// getTopProducts Tests
	// ========================================================================
	describe('getTopProducts', () => {
		it('should return top products with sales data', async () => {
			// Arrange
			const req = mockRequest({ query: { limit: '5' } })
			const res = mockResponse()

			const mockGroupedData = [
				{
					productId: 'product-1',
					_sum: { quantity: 50, price: 2500000 },
				},
				{
					productId: 'product-2',
					_sum: { quantity: 30, price: 1500000 },
				},
			]

			const mockProducts = [
				generateMockProduct({ id: 'product-1', name: 'Pepperoni Pizza' }),
				generateMockProduct({ id: 'product-2', name: 'Margherita Pizza' }),
			]

			prismaMock.orderItem.groupBy.mockResolvedValue(mockGroupedData as any)
			prismaMock.product.findMany.mockResolvedValue(mockProducts as any)

			// Act
			await getTopProducts(req as Request, res as Response)

			// Assert
			expect(res.status).toHaveBeenCalledWith(200)
			expect(res.json).toHaveBeenCalledWith({
				success: true,
				data: expect.arrayContaining([
					expect.objectContaining({
						id: 'product-1',
						name: 'Pepperoni Pizza',
						category: 'Pizza',
						totalSold: 50,
						revenue: 2500000,
					}),
				]),
			})
		})

		it('should respect limit parameter', async () => {
			// Arrange
			const req = mockRequest({ query: { limit: '3' } })
			const res = mockResponse()

			prismaMock.orderItem.groupBy.mockResolvedValue([])
			prismaMock.product.findMany.mockResolvedValue([])

			// Act
			await getTopProducts(req as Request, res as Response)

			// Assert
			expect(prismaMock.orderItem.groupBy).toHaveBeenCalledWith(
				expect.objectContaining({
					take: 3,
				}),
			)
		})

		it('should enforce minimum limit of 1 and maximum of 100', async () => {
			// Arrange
			const req = mockRequest({ query: { limit: '500' } })
			const res = mockResponse()

			prismaMock.orderItem.groupBy.mockResolvedValue([])
			prismaMock.product.findMany.mockResolvedValue([])

			// Act
			await getTopProducts(req as Request, res as Response)

			// Assert
			expect(prismaMock.orderItem.groupBy).toHaveBeenCalledWith(
				expect.objectContaining({
					take: 100, // Maximum limit enforced
				}),
			)
		})

		it('should return empty array if no products sold', async () => {
			// Arrange
			const req = mockRequest({ query: {} })
			const res = mockResponse()

			prismaMock.orderItem.groupBy.mockResolvedValue([])

			// Act
			await getTopProducts(req as Request, res as Response)

			// Assert
			expect(res.status).toHaveBeenCalledWith(200)
			expect(res.json).toHaveBeenCalledWith({
				success: true,
				data: [],
			})
		})

		it('should return 400 for invalid date range', async () => {
			// Arrange
			const req = mockRequest({
				query: { startDate: '2026-02-01', endDate: '2026-01-01' },
			})
			const res = mockResponse()

			// Act
			await getTopProducts(req as Request, res as Response)

			// Assert
			expect(res.status).toHaveBeenCalledWith(400)
		})

		it('should handle database errors', async () => {
			// Arrange
			const req = mockRequest({ query: {} })
			const res = mockResponse()

			prismaMock.orderItem.groupBy.mockRejectedValue(new Error('Database error'))

			// Act
			await getTopProducts(req as Request, res as Response)

			// Assert
			expect(res.status).toHaveBeenCalledWith(500)
		})
	})

	// ========================================================================
	// getCategoryStats Tests
	// ========================================================================
	describe('getCategoryStats', () => {
		it('should return category statistics with percentages', async () => {
			// Arrange
			const req = mockRequest({ query: {} })
			const res = mockResponse()

			const mockGroupedData = [
				{ productId: 'product-1', _sum: { quantity: 50, price: 2500000 } },
				{ productId: 'product-2', _sum: { quantity: 30, price: 1500000 } },
			]

			const mockProducts = [
				generateMockProduct({
					id: 'product-1',
					categoryId: 'cat-1',
					category: { id: 'cat-1', name: 'Pizza' },
				}),
				generateMockProduct({
					id: 'product-2',
					categoryId: 'cat-1',
					category: { id: 'cat-1', name: 'Pizza' },
				}),
			]

			prismaMock.orderItem.groupBy.mockResolvedValue(mockGroupedData as any)
			prismaMock.product.findMany.mockResolvedValue(mockProducts as any)

			// Act
			await getCategoryStats(req as Request, res as Response)

			// Assert
			expect(res.status).toHaveBeenCalledWith(200)
			expect(res.json).toHaveBeenCalledWith({
				success: true,
				data: expect.arrayContaining([
					expect.objectContaining({
						categoryId: 'cat-1',
						categoryName: 'Pizza',
						totalOrders: 80,
						revenue: 4000000,
						percentage: 100,
					}),
				]),
			})
		})

		it('should return empty array if no data', async () => {
			// Arrange
			const req = mockRequest({ query: {} })
			const res = mockResponse()

			prismaMock.orderItem.groupBy.mockResolvedValue([])

			// Act
			await getCategoryStats(req as Request, res as Response)

			// Assert
			expect(res.status).toHaveBeenCalledWith(200)
			expect(res.json).toHaveBeenCalledWith({
				success: true,
				data: [],
			})
		})

		it('should handle multiple categories with correct percentages', async () => {
			// Arrange
			const req = mockRequest({ query: {} })
			const res = mockResponse()

			const mockGroupedData = [
				{ productId: 'product-1', _sum: { quantity: 50, price: 750000 } },
				{ productId: 'product-2', _sum: { quantity: 30, price: 250000 } },
			]

			const mockProducts = [
				generateMockProduct({
					id: 'product-1',
					categoryId: 'cat-1',
					category: { id: 'cat-1', name: 'Pizza' },
				}),
				generateMockProduct({
					id: 'product-2',
					categoryId: 'cat-2',
					category: { id: 'cat-2', name: 'Drinks' },
				}),
			]

			prismaMock.orderItem.groupBy.mockResolvedValue(mockGroupedData as any)
			prismaMock.product.findMany.mockResolvedValue(mockProducts as any)

			// Act
			await getCategoryStats(req as Request, res as Response)

			// Assert
			expect(res.status).toHaveBeenCalledWith(200)
			const responseData = (res.json as jest.Mock).mock.calls[0][0].data
			expect(responseData).toHaveLength(2)
			expect(responseData[0].percentage).toBeCloseTo(75, 0) // 750k/1000k = 75%
			expect(responseData[1].percentage).toBeCloseTo(25, 0) // 250k/1000k = 25%
		})

		it('should handle database errors', async () => {
			// Arrange
			const req = mockRequest({ query: {} })
			const res = mockResponse()

			prismaMock.orderItem.groupBy.mockRejectedValue(new Error('Database error'))

			// Act
			await getCategoryStats(req as Request, res as Response)

			// Assert
			expect(res.status).toHaveBeenCalledWith(500)
		})
	})

	// ========================================================================
	// getRecentOrders Tests
	// ========================================================================
	describe('getRecentOrders', () => {
		it('should return recent orders with user and items', async () => {
			// Arrange
			const req = mockRequest({ query: { limit: '10' } })
			const res = mockResponse()

			const mockOrders = [
				{
					...generateMockOrder({ id: 'order-1', totalPrice: 50000 }),
					user: { name: 'John Doe' },
					items: [{ quantity: 2 }, { quantity: 1 }],
				},
			]

			prismaMock.order.findMany.mockResolvedValue(mockOrders as any)

			// Act
			await getRecentOrders(req as Request, res as Response)

			// Assert
			expect(res.status).toHaveBeenCalledWith(200)
			expect(res.json).toHaveBeenCalledWith({
				success: true,
				data: expect.arrayContaining([
					expect.objectContaining({
						id: 'order-1',
						customerName: 'John Doe',
						total: 50000,
						status: 'DELIVERED',
						items: 3, // 2 + 1
					}),
				]),
			})
		})

		it('should use default limit of 10', async () => {
			// Arrange
			const req = mockRequest({ query: {} })
			const res = mockResponse()

			prismaMock.order.findMany.mockResolvedValue([])

			// Act
			await getRecentOrders(req as Request, res as Response)

			// Assert
			expect(prismaMock.order.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					take: 10,
				}),
			)
		})

		it('should handle orders without user (guest)', async () => {
			// Arrange
			const req = mockRequest({ query: {} })
			const res = mockResponse()

			const mockOrders = [
				{
					...generateMockOrder(),
					user: null,
					items: [{ quantity: 1 }],
				},
			]

			prismaMock.order.findMany.mockResolvedValue(mockOrders as any)

			// Act
			await getRecentOrders(req as Request, res as Response)

			// Assert
			expect(res.status).toHaveBeenCalledWith(200)
			const responseData = (res.json as jest.Mock).mock.calls[0][0].data
			expect(responseData[0].customerName).toBe('Guest')
		})

		it('should handle database errors', async () => {
			// Arrange
			const req = mockRequest({ query: {} })
			const res = mockResponse()

			prismaMock.order.findMany.mockRejectedValue(new Error('Database error'))

			// Act
			await getRecentOrders(req as Request, res as Response)

			// Assert
			expect(res.status).toHaveBeenCalledWith(500)
		})
	})
})
