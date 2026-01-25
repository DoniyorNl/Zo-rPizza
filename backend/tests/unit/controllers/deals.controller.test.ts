// backend/tests/unit/controllers/deals.controller.test.ts
// 🍕 DEALS CONTROLLER TESTS

import { Request, Response } from 'express'
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended'
import prisma from '../../../src/lib/prisma'
import {
	getAllDeals,
	getDealById,
	createDeal,
	updateDeal,
	deleteDeal,
} from '../../../src/controllers/deals.controller'

// Mock Prisma
jest.mock('../../../src/lib/prisma', () => ({
	__esModule: true,
	default: mockDeep<typeof prisma>(),
}))

const prismaMock = prisma as unknown as DeepMockProxy<typeof prisma>

// Helper Functions
const mockRequest = (overrides = {}): Partial<Request> => ({
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

const generateMockDeal = (overrides = {}) => ({
	id: 'deal-1',
	title: 'Family Deal',
	description: '2 Large Pizzas + 2 Drinks',
	imageUrl: 'https://example.com/deal.jpg',
	discountType: 'PERCENT' as const,
	discountValue: 30,
	isActive: true,
	startsAt: new Date('2026-01-01'),
	endsAt: new Date('2026-12-31'),
	createdAt: new Date(),
	updatedAt: new Date(),
	...overrides,
})

const generateMockDealItem = (overrides = {}) => ({
	id: 'deal-item-1',
	dealId: 'deal-1',
	productId: 'product-1',
	itemType: 'PIZZA' as const,
	quantity: 2,
	product: {
		id: 'product-1',
		name: 'Margherita Pizza',
		price: 25000,
	},
	...overrides,
})

// Reset mocks before each test
beforeEach(() => {
	mockReset(prismaMock)
})

// ==========================================
// GET ALL DEALS
// ==========================================
describe('Deals Controller - getAllDeals', () => {
	it('should return all deals with items and products', async () => {
		const req = mockRequest()
		const res = mockResponse()

		const mockDeals = [
			{
				...generateMockDeal(),
				items: [generateMockDealItem()],
			},
			{
				...generateMockDeal({ id: 'deal-2', title: 'Lunch Special' }),
				items: [],
			},
		]

		prismaMock.deal.findMany.mockResolvedValue(mockDeals as any)

		await getAllDeals(req as Request, res as Response)

		expect(prismaMock.deal.findMany).toHaveBeenCalledWith({
			include: {
				items: {
					include: {
						product: true,
					},
				},
			},
			orderBy: { createdAt: 'desc' },
		})
		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith({
			success: true,
			count: 2,
			data: mockDeals,
		})
	})

	it('should return empty array if no deals found', async () => {
		const req = mockRequest()
		const res = mockResponse()

		prismaMock.deal.findMany.mockResolvedValue([])

		await getAllDeals(req as Request, res as Response)

		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith({
			success: true,
			count: 0,
			data: [],
		})
	})

	it('should handle database errors', async () => {
		const req = mockRequest()
		const res = mockResponse()

		prismaMock.deal.findMany.mockRejectedValue(new Error('Database error'))

		await getAllDeals(req as Request, res as Response)

		expect(res.status).toHaveBeenCalledWith(500)
		expect(res.json).toHaveBeenCalledWith({
			success: false,
			message: 'Server error',
		})
	})
})

// ==========================================
// GET DEAL BY ID
// ==========================================
describe('Deals Controller - getDealById', () => {
	it('should return deal with items and products', async () => {
		const req = mockRequest({ params: { id: 'deal-1' } })
		const res = mockResponse()

		const mockDeal = {
			...generateMockDeal(),
			items: [generateMockDealItem()],
		}

		prismaMock.deal.findUnique.mockResolvedValue(mockDeal as any)

		await getDealById(req as Request, res as Response)

		expect(prismaMock.deal.findUnique).toHaveBeenCalledWith({
			where: { id: 'deal-1' },
			include: {
				items: {
					include: {
						product: true,
					},
				},
			},
		})
		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith({
			success: true,
			data: mockDeal,
		})
	})

	it('should handle array id parameter', async () => {
		const req = mockRequest({ params: { id: ['deal-1'] } })
		const res = mockResponse()

		const mockDeal = generateMockDeal()
		prismaMock.deal.findUnique.mockResolvedValue(mockDeal as any)

		await getDealById(req as Request, res as Response)

		expect(prismaMock.deal.findUnique).toHaveBeenCalledWith({
			where: { id: 'deal-1' },
			include: {
				items: {
					include: {
						product: true,
					},
				},
			},
		})
	})

	it('should return 404 if deal not found', async () => {
		const req = mockRequest({ params: { id: 'non-existent' } })
		const res = mockResponse()

		prismaMock.deal.findUnique.mockResolvedValue(null)

		await getDealById(req as Request, res as Response)

		expect(res.status).toHaveBeenCalledWith(404)
		expect(res.json).toHaveBeenCalledWith({
			success: false,
			message: 'Deal not found',
		})
	})

	it('should return 400 for invalid id', async () => {
		const req = mockRequest({ params: { id: null } })
		const res = mockResponse()

		await getDealById(req as Request, res as Response)

		expect(res.status).toHaveBeenCalledWith(400)
		expect(res.json).toHaveBeenCalledWith({
			success: false,
			message: 'Invalid id',
		})
	})

	it('should handle database errors', async () => {
		const req = mockRequest({ params: { id: 'deal-1' } })
		const res = mockResponse()

		prismaMock.deal.findUnique.mockRejectedValue(new Error('Database error'))

		await getDealById(req as Request, res as Response)

		expect(res.status).toHaveBeenCalledWith(500)
		expect(res.json).toHaveBeenCalledWith({
			success: false,
			message: 'Server error',
		})
	})
})

// ==========================================
// CREATE DEAL
// ==========================================
describe('Deals Controller - createDeal', () => {
	it('should create deal with valid data', async () => {
		const req = mockRequest({
			body: {
				title: 'Weekend Deal',
				description: 'Special weekend offer',
				imageUrl: 'https://example.com/weekend.jpg',
				discountType: 'PERCENT',
				discountValue: 25,
				isActive: true,
				startsAt: '2026-01-01',
				endsAt: '2026-12-31',
				items: [
					{
						productId: 'product-1',
						itemType: 'PIZZA',
						quantity: 2,
					},
				],
			},
		})
		const res = mockResponse()

		const mockDeal = {
			...generateMockDeal({ title: 'Weekend Deal' }),
			items: [generateMockDealItem()],
		}

		prismaMock.deal.create.mockResolvedValue(mockDeal as any)

		await createDeal(req as Request, res as Response)

		expect(prismaMock.deal.create).toHaveBeenCalled()
		expect(res.status).toHaveBeenCalledWith(201)
		expect(res.json).toHaveBeenCalledWith({
			success: true,
			message: 'Deal created successfully',
			data: mockDeal,
		})
	})

	it('should return 400 if validation fails', async () => {
		const req = mockRequest({
			body: {
				// Missing required fields
				title: 'Invalid Deal',
			},
		})
		const res = mockResponse()

		await createDeal(req as Request, res as Response)

		expect(res.status).toHaveBeenCalledWith(400)
		expect(res.json).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				message: 'Validation error',
			})
		)
	})

	it('should handle database errors', async () => {
		const req = mockRequest({
			body: {
				title: 'Test Deal',
				description: 'Test',
				discountType: 'PERCENT',
				discountValue: 20,
				isActive: true,
				startsAt: '2026-01-01',
				endsAt: '2026-12-31',
				items: [
					{
						productId: 'product-1',
						itemType: 'PIZZA',
						quantity: 1,
					},
				],
			},
		})
		const res = mockResponse()

		prismaMock.deal.create.mockRejectedValue(new Error('Database error'))

		await createDeal(req as Request, res as Response)

		expect(res.status).toHaveBeenCalledWith(500)
		expect(res.json).toHaveBeenCalledWith({
			success: false,
			message: 'Server error',
		})
	})
})

// ==========================================
// UPDATE DEAL
// ==========================================
describe('Deals Controller - updateDeal', () => {
	it('should update deal with valid data', async () => {
		const req = mockRequest({
			params: { id: 'deal-1' },
			body: {
				title: 'Updated Deal',
				description: 'Updated description',
				discountType: 'PERCENT',
				discountValue: 20,
				isActive: true,
				startsAt: '2026-01-01',
				endsAt: '2026-12-31',
				items: [
					{
						productId: 'product-1',
						itemType: 'PIZZA',
						quantity: 1,
					},
				],
			},
		})
		const res = mockResponse()

		const existingDeal = generateMockDeal()
		const updatedDeal = {
			...existingDeal,
			title: 'Updated Deal',
		}

		prismaMock.deal.findUnique.mockResolvedValue(existingDeal as any)
		prismaMock.dealItem.deleteMany.mockResolvedValue({ count: 0 } as any)
		prismaMock.deal.update.mockResolvedValue(updatedDeal as any)

		await updateDeal(req as Request, res as Response)

		expect(prismaMock.deal.update).toHaveBeenCalled()
		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith({
			success: true,
			message: 'Deal updated successfully',
			data: updatedDeal,
		})
	})

	it('should return 400 for invalid id', async () => {
		const req = mockRequest({
			params: { id: null },
			body: { name: 'Test' },
		})
		const res = mockResponse()

		await updateDeal(req as Request, res as Response)

		expect(res.status).toHaveBeenCalledWith(400)
		expect(res.json).toHaveBeenCalledWith({
			success: false,
			message: 'Invalid id',
		})
	})

	it('should return 400 if validation fails', async () => {
		const req = mockRequest({
			params: { id: 'deal-1' },
			body: {
				// Invalid data - missing required field when updating
				discountValue: -10, // Invalid negative value
			},
		})
		const res = mockResponse()

		await updateDeal(req as Request, res as Response)

		expect(res.status).toHaveBeenCalledWith(400)
		expect(res.json).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				message: 'Validation error',
			})
		)
	})

	it('should return 404 if deal not found', async () => {
		const req = mockRequest({
			params: { id: 'non-existent' },
			body: {
				title: 'Test',
				discountType: 'PERCENT',
				discountValue: 20,
			},
		})
		const res = mockResponse()

		prismaMock.deal.findUnique.mockResolvedValue(null)

		await updateDeal(req as Request, res as Response)

		expect(res.status).toHaveBeenCalledWith(404)
		expect(res.json).toHaveBeenCalledWith({
			success: false,
			message: 'Deal not found',
		})
	})

	it('should handle database errors', async () => {
		const req = mockRequest({
			params: { id: 'deal-1' },
			body: {
				title: 'Test',
				discountType: 'PERCENT',
				discountValue: 20,
			},
		})
		const res = mockResponse()

		prismaMock.deal.findUnique.mockRejectedValue(new Error('Database error'))

		await updateDeal(req as Request, res as Response)

		expect(res.status).toHaveBeenCalledWith(500)
		expect(res.json).toHaveBeenCalledWith({
			success: false,
			message: 'Server error',
		})
	})
})

// ==========================================
// DELETE DEAL
// ==========================================
describe('Deals Controller - deleteDeal', () => {
	it('should delete deal successfully', async () => {
		const req = mockRequest({ params: { id: 'deal-1' } })
		const res = mockResponse()

		const existingDeal = generateMockDeal()

		prismaMock.deal.findUnique.mockResolvedValue(existingDeal as any)
		prismaMock.deal.delete.mockResolvedValue(existingDeal as any)

		await deleteDeal(req as Request, res as Response)

		expect(prismaMock.deal.delete).toHaveBeenCalledWith({
			where: { id: 'deal-1' },
		})
		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith({
			success: true,
			message: 'Deal deleted successfully',
		})
	})

	it('should return 400 for invalid id', async () => {
		const req = mockRequest({ params: { id: null } })
		const res = mockResponse()

		await deleteDeal(req as Request, res as Response)

		expect(res.status).toHaveBeenCalledWith(400)
		expect(res.json).toHaveBeenCalledWith({
			success: false,
			message: 'Invalid id',
		})
	})

	it('should return 404 if deal not found', async () => {
		const req = mockRequest({ params: { id: 'non-existent' } })
		const res = mockResponse()

		prismaMock.deal.findUnique.mockResolvedValue(null)

		await deleteDeal(req as Request, res as Response)

		expect(res.status).toHaveBeenCalledWith(404)
		expect(res.json).toHaveBeenCalledWith({
			success: false,
			message: 'Deal not found',
		})
	})

	it('should handle database errors', async () => {
		const req = mockRequest({ params: { id: 'deal-1' } })
		const res = mockResponse()

		prismaMock.deal.findUnique.mockRejectedValue(new Error('Database error'))

		await deleteDeal(req as Request, res as Response)

		expect(res.status).toHaveBeenCalledWith(500)
		expect(res.json).toHaveBeenCalledWith({
			success: false,
			message: 'Server error',
		})
	})
})
