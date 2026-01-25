// backend/tests/unit/controllers/coupons.controller.test.ts
// 🍕 COUPONS CONTROLLER TESTS

import { Request, Response } from 'express'
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended'
import prisma from '../../../src/lib/prisma'
import {
	getAllCoupons,
	getCouponById,
	createCoupon,
	updateCoupon,
	deleteCoupon,
} from '../../../src/controllers/coupons.controller'

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

const generateMockCoupon = (overrides = {}) => ({
	id: 'coupon-1',
	code: 'SUMMER25',
	description: '25% off for summer',
	discountType: 'PERCENT' as const,
	discountValue: 25,
	isActive: true,
	startsAt: new Date('2026-06-01'),
	endsAt: new Date('2026-08-31'),
	usageLimit: 100,
	perUserLimit: 5,
	createdAt: new Date(),
	updatedAt: new Date(),
	...overrides,
})

// Reset mocks before each test
beforeEach(() => {
	mockReset(prismaMock)
})

// ==========================================
// GET ALL COUPONS
// ==========================================
describe('Coupons Controller - getAllCoupons', () => {
	it('should return all coupons ordered by creation date', async () => {
		const req = mockRequest()
		const res = mockResponse()

		const mockCoupons = [
			generateMockCoupon(),
			generateMockCoupon({
				id: 'coupon-2',
				code: 'WINTER30',
				discountValue: 30,
			}),
		]

		prismaMock.coupon.findMany.mockResolvedValue(mockCoupons as any)

		await getAllCoupons(req as Request, res as Response)

		expect(prismaMock.coupon.findMany).toHaveBeenCalledWith({
			orderBy: { createdAt: 'desc' },
		})
		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith({
			success: true,
			count: 2,
			data: mockCoupons,
		})
	})

	it('should return empty array if no coupons found', async () => {
		const req = mockRequest()
		const res = mockResponse()

		prismaMock.coupon.findMany.mockResolvedValue([])

		await getAllCoupons(req as Request, res as Response)

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

		prismaMock.coupon.findMany.mockRejectedValue(new Error('Database error'))

		await getAllCoupons(req as Request, res as Response)

		expect(res.status).toHaveBeenCalledWith(500)
		expect(res.json).toHaveBeenCalledWith({
			success: false,
			message: 'Server error',
		})
	})
})

// ==========================================
// GET COUPON BY ID
// ==========================================
describe('Coupons Controller - getCouponById', () => {
	it('should return coupon by id', async () => {
		const req = mockRequest({ params: { id: 'coupon-1' } })
		const res = mockResponse()

		const mockCoupon = generateMockCoupon()

		prismaMock.coupon.findUnique.mockResolvedValue(mockCoupon as any)

		await getCouponById(req as Request, res as Response)

		expect(prismaMock.coupon.findUnique).toHaveBeenCalledWith({
			where: { id: 'coupon-1' },
		})
		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith({
			success: true,
			data: mockCoupon,
		})
	})

	it('should handle array id parameter', async () => {
		const req = mockRequest({ params: { id: ['coupon-1'] } })
		const res = mockResponse()

		const mockCoupon = generateMockCoupon()
		prismaMock.coupon.findUnique.mockResolvedValue(mockCoupon as any)

		await getCouponById(req as Request, res as Response)

		expect(prismaMock.coupon.findUnique).toHaveBeenCalledWith({
			where: { id: 'coupon-1' },
		})
	})

	it('should return 404 if coupon not found', async () => {
		const req = mockRequest({ params: { id: 'non-existent' } })
		const res = mockResponse()

		prismaMock.coupon.findUnique.mockResolvedValue(null)

		await getCouponById(req as Request, res as Response)

		expect(res.status).toHaveBeenCalledWith(404)
		expect(res.json).toHaveBeenCalledWith({
			success: false,
			message: 'Coupon not found',
		})
	})

	it('should return 400 for invalid id', async () => {
		const req = mockRequest({ params: { id: null } })
		const res = mockResponse()

		await getCouponById(req as Request, res as Response)

		expect(res.status).toHaveBeenCalledWith(400)
		expect(res.json).toHaveBeenCalledWith({
			success: false,
			message: 'Invalid id',
		})
	})

	it('should handle database errors', async () => {
		const req = mockRequest({ params: { id: 'coupon-1' } })
		const res = mockResponse()

		prismaMock.coupon.findUnique.mockRejectedValue(new Error('Database error'))

		await getCouponById(req as Request, res as Response)

		expect(res.status).toHaveBeenCalledWith(500)
		expect(res.json).toHaveBeenCalledWith({
			success: false,
			message: 'Server error',
		})
	})
})

// ==========================================
// CREATE COUPON
// ==========================================
describe('Coupons Controller - createCoupon', () => {
	it('should create coupon with valid data', async () => {
		const req = mockRequest({
			body: {
				code: 'NEWUSER20',
				description: '20% off for new users',
				discountType: 'PERCENT',
				discountValue: 20,
				usageLimit: 50,
				perUserLimit: 1,
				isActive: true,
				startsAt: '2026-01-01',
				endsAt: '2026-12-31',
			},
		})
		const res = mockResponse()

		const mockCoupon = generateMockCoupon({
			code: 'NEWUSER20',
			discountValue: 20,
		})

		prismaMock.coupon.create.mockResolvedValue(mockCoupon as any)

		await createCoupon(req as Request, res as Response)

		expect(prismaMock.coupon.create).toHaveBeenCalled()
		expect(res.status).toHaveBeenCalledWith(201)
		expect(res.json).toHaveBeenCalledWith({
			success: true,
			message: 'Coupon created successfully',
			data: mockCoupon,
		})
	})

	it('should return 400 if validation fails', async () => {
		const req = mockRequest({
			body: {
				// Missing required fields
				code: 'INVALID',
			},
		})
		const res = mockResponse()

		await createCoupon(req as Request, res as Response)

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
				code: 'TEST',
				description: 'Test coupon',
				discountType: 'PERCENT',
				discountValue: 10,
				isActive: true,
				startsAt: '2026-01-01',
				endsAt: '2026-12-31',
			},
		})
		const res = mockResponse()

		prismaMock.coupon.create.mockRejectedValue(new Error('Database error'))

		await createCoupon(req as Request, res as Response)

		expect(res.status).toHaveBeenCalledWith(500)
		expect(res.json).toHaveBeenCalledWith({
			success: false,
			message: 'Server error',
		})
	})
})

// ==========================================
// UPDATE COUPON
// ==========================================
describe('Coupons Controller - updateCoupon', () => {
	it('should update coupon with valid data', async () => {
		const req = mockRequest({
			params: { id: 'coupon-1' },
			body: {
				code: 'UPDATED25',
				description: 'Updated description',
				discountType: 'PERCENT',
				discountValue: 25,
				isActive: true,
			},
		})
		const res = mockResponse()

		const existingCoupon = generateMockCoupon()
		const updatedCoupon = {
			...existingCoupon,
			code: 'UPDATED25',
		}

		prismaMock.coupon.findUnique.mockResolvedValue(existingCoupon as any)
		prismaMock.coupon.update.mockResolvedValue(updatedCoupon as any)

		await updateCoupon(req as Request, res as Response)

		expect(prismaMock.coupon.update).toHaveBeenCalled()
		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith({
			success: true,
			message: 'Coupon updated successfully',
			data: updatedCoupon,
		})
	})

	it('should return 400 for invalid id', async () => {
		const req = mockRequest({
			params: { id: null },
			body: { code: 'TEST' },
		})
		const res = mockResponse()

		await updateCoupon(req as Request, res as Response)

		expect(res.status).toHaveBeenCalledWith(400)
		expect(res.json).toHaveBeenCalledWith({
			success: false,
			message: 'Invalid id',
		})
	})

	it('should return 400 if validation fails', async () => {
		const req = mockRequest({
			params: { id: 'coupon-1' },
			body: {
				// Invalid data
				discountValue: -10, // Negative value
			},
		})
		const res = mockResponse()

		await updateCoupon(req as Request, res as Response)

		expect(res.status).toHaveBeenCalledWith(400)
		expect(res.json).toHaveBeenCalledWith(
			expect.objectContaining({
				success: false,
				message: 'Validation error',
			})
		)
	})

	it('should return 404 if coupon not found', async () => {
		const req = mockRequest({
			params: { id: 'non-existent' },
			body: {
				code: 'TEST',
				discountType: 'PERCENT',
				discountValue: 10,
			},
		})
		const res = mockResponse()

		prismaMock.coupon.findUnique.mockResolvedValue(null)

		await updateCoupon(req as Request, res as Response)

		expect(res.status).toHaveBeenCalledWith(404)
		expect(res.json).toHaveBeenCalledWith({
			success: false,
			message: 'Coupon not found',
		})
	})

	it('should handle database errors', async () => {
		const req = mockRequest({
			params: { id: 'coupon-1' },
			body: {
				code: 'TEST',
				discountType: 'PERCENT',
				discountValue: 10,
			},
		})
		const res = mockResponse()

		prismaMock.coupon.findUnique.mockRejectedValue(new Error('Database error'))

		await updateCoupon(req as Request, res as Response)

		expect(res.status).toHaveBeenCalledWith(500)
		expect(res.json).toHaveBeenCalledWith({
			success: false,
			message: 'Server error',
		})
	})
})

// ==========================================
// DELETE COUPON
// ==========================================
describe('Coupons Controller - deleteCoupon', () => {
	it('should delete coupon successfully', async () => {
		const req = mockRequest({ params: { id: 'coupon-1' } })
		const res = mockResponse()

		const existingCoupon = generateMockCoupon()

		prismaMock.coupon.findUnique.mockResolvedValue(existingCoupon as any)
		prismaMock.coupon.delete.mockResolvedValue(existingCoupon as any)

		await deleteCoupon(req as Request, res as Response)

		expect(prismaMock.coupon.delete).toHaveBeenCalledWith({
			where: { id: 'coupon-1' },
		})
		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith({
			success: true,
			message: 'Coupon deleted successfully',
		})
	})

	it('should return 400 for invalid id', async () => {
		const req = mockRequest({ params: { id: null } })
		const res = mockResponse()

		await deleteCoupon(req as Request, res as Response)

		expect(res.status).toHaveBeenCalledWith(400)
		expect(res.json).toHaveBeenCalledWith({
			success: false,
			message: 'Invalid id',
		})
	})

	it('should return 404 if coupon not found', async () => {
		const req = mockRequest({ params: { id: 'non-existent' } })
		const res = mockResponse()

		prismaMock.coupon.findUnique.mockResolvedValue(null)

		await deleteCoupon(req as Request, res as Response)

		expect(res.status).toHaveBeenCalledWith(404)
		expect(res.json).toHaveBeenCalledWith({
			success: false,
			message: 'Coupon not found',
		})
	})

	it('should handle database errors', async () => {
		const req = mockRequest({ params: { id: 'coupon-1' } })
		const res = mockResponse()

		prismaMock.coupon.findUnique.mockRejectedValue(new Error('Database error'))

		await deleteCoupon(req as Request, res as Response)

		expect(res.status).toHaveBeenCalledWith(500)
		expect(res.json).toHaveBeenCalledWith({
			success: false,
			message: 'Server error',
		})
	})
})
