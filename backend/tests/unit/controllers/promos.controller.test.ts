// backend/tests/unit/controllers/promos.controller.test.ts
// 🍕 PROMOS CONTROLLER TESTS

import { Request, Response } from 'express'
import { validatePromoCode } from '@/controllers/promos.controller'
import { prismaMock } from '../../setup'
import { generateMockUser } from '../../setup'

const mockRequest = (overrides = {}): Partial<Request> => ({
	params: {},
	body: {},
	query: {},
	...overrides,
})

const mockResponse = (): Partial<Response> => ({
	status: jest.fn().mockReturnThis(),
	json: jest.fn().mockReturnThis(),
})

const generateMockCoupon = (overrides = {}) => ({
	id: 'coupon-1',
	code: 'PIZZA20',
	description: null,
	discountType: 'PERCENT' as const,
	discountValue: 20,
	minOrderTotal: 50000,
	isActive: true,
	startsAt: null,
	endsAt: null,
	usageLimit: 100,
	perUserLimit: 1,
	createdAt: new Date(),
	updatedAt: new Date(),
	...overrides,
})

describe('Promos Controller', () => {
	describe('validatePromoCode', () => {
		it('should return 400 when code is missing', async () => {
			const req = mockRequest({ body: { orderTotal: 100000 } })
			const res = mockResponse()

			await validatePromoCode(req as Request, res as Response)

			expect(res.status).toHaveBeenCalledWith(400)
			expect(res.json).toHaveBeenCalledWith({
				success: false,
				message: 'Code is required',
			})
		})

		it('should return valid: false when coupon not found', async () => {
			prismaMock.coupon.findUnique.mockResolvedValue(null)
			const req = mockRequest({ body: { code: 'INVALID', orderTotal: 100000 } })
			const res = mockResponse()

			await validatePromoCode(req as Request, res as Response)

			expect(res.status).toHaveBeenCalledWith(200)
			expect(res.json).toHaveBeenCalledWith({
				success: true,
				valid: false,
				message: 'Promo code not found or inactive',
			})
		})

		it('should return valid: true and discount data for valid coupon', async () => {
			const coupon = generateMockCoupon({ discountType: 'PERCENT', discountValue: 20 })
			prismaMock.coupon.findUnique.mockResolvedValue(coupon as any)
			prismaMock.couponUsage.count.mockResolvedValue(0)

			const req = mockRequest({ body: { code: 'PIZZA20', orderTotal: 100000 } })
			const res = mockResponse()

			await validatePromoCode(req as Request, res as Response)

			expect(res.status).toHaveBeenCalledWith(200)
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					valid: true,
					message: 'Valid',
					data: expect.objectContaining({
						couponId: 'coupon-1',
						code: 'PIZZA20',
						discountAmount: 20000,
						discountType: 'PERCENT',
						discountValue: 20,
					}),
				}),
			)
		})

		it('should return valid: false when order total below minOrderTotal', async () => {
			const coupon = generateMockCoupon({ minOrderTotal: 100000 })
			prismaMock.coupon.findUnique.mockResolvedValue(coupon as any)

			const req = mockRequest({ body: { code: 'PIZZA20', orderTotal: 50000 } })
			const res = mockResponse()

			await validatePromoCode(req as Request, res as Response)

			expect(res.status).toHaveBeenCalledWith(200)
			expect(res.json).toHaveBeenCalledWith({
				success: true,
				valid: false,
				message: 'Minimum order total: 100000',
			})
		})

		it('should return valid: false when usage limit reached', async () => {
			const coupon = generateMockCoupon({ usageLimit: 10 })
			prismaMock.coupon.findUnique.mockResolvedValue(coupon as any)
			prismaMock.couponUsage.count.mockResolvedValue(10)

			const req = mockRequest({ body: { code: 'PIZZA20', orderTotal: 100000 } })
			const res = mockResponse()

			await validatePromoCode(req as Request, res as Response)

			expect(res.status).toHaveBeenCalledWith(200)
			expect(res.json).toHaveBeenCalledWith({
				success: true,
				valid: false,
				message: 'Promo code usage limit reached',
			})
		})

		it('should return valid: false when perUserLimit reached', async () => {
			const coupon = generateMockCoupon({ perUserLimit: 1 })
			const dbUser = generateMockUser({ id: 'user-1' })
			prismaMock.coupon.findUnique.mockResolvedValue(coupon as any)
			prismaMock.user.findFirst.mockResolvedValue(dbUser as any)
			prismaMock.couponUsage.count.mockResolvedValue(1)

			const req = mockRequest({
				body: { code: 'PIZZA20', orderTotal: 100000 },
				userId: 'firebase-uid',
			} as any)
			const res = mockResponse()

			await validatePromoCode(req as Request, res as Response)

			expect(res.status).toHaveBeenCalledWith(200)
			expect(res.json).toHaveBeenCalledWith({
				success: true,
				valid: false,
				message: 'You have already used this code',
			})
		})

		it('should return 500 on database error', async () => {
			prismaMock.coupon.findUnique.mockRejectedValue(new Error('DB error'))
			const req = mockRequest({ body: { code: 'PIZZA20', orderTotal: 100000 } })
			const res = mockResponse()

			await validatePromoCode(req as Request, res as Response)

			expect(res.status).toHaveBeenCalledWith(500)
			expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Server error' })
		})
	})
})
