import { Request, Response } from 'express'
import { validatePromoCode } from '../../src/controllers/promos.controller'
import { prismaMock, generateMockUser } from '../setup'
import type { AuthRequest } from '../../src/middleware/firebase-auth.middleware'

const mockReq = (body: { code?: string; orderTotal?: number }, userId?: string): Partial<AuthRequest> =>
	({ body, userId } as Partial<AuthRequest>)

describe('Promos API Integration', () => {
	let mockRes: Partial<Response>
	let mockJson: jest.Mock
	let mockStatus: jest.Mock

	beforeEach(() => {
		mockJson = jest.fn()
		mockStatus = jest.fn().mockReturnValue({ json: mockJson })
		mockRes = { status: mockStatus, json: mockJson }
	})

	describe('POST /api/promos/validate', () => {
		it('returns 400 when code missing', async () => {
			await validatePromoCode(
				mockReq({ orderTotal: 50000 }) as Request,
				mockRes as Response,
			)
			expect(mockStatus).toHaveBeenCalledWith(400)
			expect(mockJson).toHaveBeenCalledWith({ success: false, message: 'Code is required' })
		})

		it('returns valid: false when coupon not found', async () => {
			prismaMock.coupon.findUnique.mockResolvedValue(null)
			await validatePromoCode(
				mockReq({ code: 'UNKNOWN', orderTotal: 50000 }, 'uid-1') as Request,
				mockRes as Response,
			)
			expect(mockStatus).toHaveBeenCalledWith(200)
			expect(mockJson).toHaveBeenCalledWith({
				success: true,
				valid: false,
				message: 'Promo code not found or inactive',
			})
		})

		it('returns valid: false when promo not yet active', async () => {
			const future = new Date(Date.now() + 86400000)
			prismaMock.coupon.findUnique.mockResolvedValue({
				id: 'c1',
				code: 'PROMO',
				isActive: true,
				startsAt: future,
				endsAt: null,
				minOrderTotal: 0,
				usageLimit: null,
				perUserLimit: null,
				discountType: 'PERCENT',
				discountValue: 10,
			} as any)
			await validatePromoCode(
				mockReq({ code: 'promo', orderTotal: 50000 }, 'uid-1') as Request,
				mockRes as Response,
			)
			expect(mockStatus).toHaveBeenCalledWith(200)
			expect(mockJson).toHaveBeenCalledWith({
				success: true,
				valid: false,
				message: 'Promo code not yet active',
			})
		})

		it('returns valid: false when promo expired', async () => {
			const past = new Date(Date.now() - 86400000)
			prismaMock.coupon.findUnique.mockResolvedValue({
				id: 'c1',
				code: 'PROMO',
				isActive: true,
				startsAt: null,
				endsAt: past,
				minOrderTotal: 0,
				usageLimit: null,
				perUserLimit: null,
				discountType: 'PERCENT',
				discountValue: 10,
			} as any)
			await validatePromoCode(
				mockReq({ code: 'promo', orderTotal: 50000 }) as Request,
				mockRes as Response,
			)
			expect(mockStatus).toHaveBeenCalledWith(200)
			expect(mockJson).toHaveBeenCalledWith({
				success: true,
				valid: false,
				message: 'Promo code has expired',
			})
		})

		it('returns valid: false when order total below minOrderTotal', async () => {
			prismaMock.coupon.findUnique.mockResolvedValue({
				id: 'c1',
				code: 'PROMO',
				isActive: true,
				startsAt: null,
				endsAt: null,
				minOrderTotal: 100000,
				usageLimit: null,
				perUserLimit: null,
				discountType: 'PERCENT',
				discountValue: 10,
			} as any)
			await validatePromoCode(
				mockReq({ code: 'promo', orderTotal: 50000 }) as Request,
				mockRes as Response,
			)
			expect(mockStatus).toHaveBeenCalledWith(200)
			expect(mockJson).toHaveBeenCalledWith({
				success: true,
				valid: false,
				message: 'Minimum order total: 100000',
			})
		})

		it('returns valid: false when usage limit reached', async () => {
			prismaMock.coupon.findUnique.mockResolvedValue({
				id: 'c1',
				code: 'PROMO',
				isActive: true,
				startsAt: null,
				endsAt: null,
				minOrderTotal: 0,
				usageLimit: 5,
				perUserLimit: null,
				discountType: 'PERCENT',
				discountValue: 10,
			} as any)
			prismaMock.couponUsage.count.mockResolvedValue(5)
			await validatePromoCode(
				mockReq({ code: 'promo', orderTotal: 50000 }) as Request,
				mockRes as Response,
			)
			expect(mockStatus).toHaveBeenCalledWith(200)
			expect(mockJson).toHaveBeenCalledWith({
				success: true,
				valid: false,
				message: 'Promo code usage limit reached',
			})
		})

		it('returns valid: false when perUserLimit exceeded', async () => {
			prismaMock.coupon.findUnique.mockResolvedValue({
				id: 'c1',
				code: 'PROMO',
				isActive: true,
				startsAt: null,
				endsAt: null,
				minOrderTotal: 0,
				usageLimit: null,
				perUserLimit: 1,
				discountType: 'PERCENT',
				discountValue: 10,
			} as any)
			prismaMock.user.findFirst.mockResolvedValue(generateMockUser({ id: 'user-1' }) as any)
			prismaMock.couponUsage.count.mockResolvedValue(1)
			await validatePromoCode(
				mockReq({ code: 'promo', orderTotal: 50000 }, 'firebase-uid') as Request,
				mockRes as Response,
			)
			expect(mockStatus).toHaveBeenCalledWith(200)
			expect(mockJson).toHaveBeenCalledWith({
				success: true,
				valid: false,
				message: 'You have already used this code',
			})
		})

		it('returns valid: true with discount for PERCENT coupon', async () => {
			prismaMock.coupon.findUnique.mockResolvedValue({
				id: 'c1',
				code: 'PROMO10',
				isActive: true,
				startsAt: null,
				endsAt: null,
				minOrderTotal: 0,
				usageLimit: null,
				perUserLimit: null,
				discountType: 'PERCENT',
				discountValue: 10,
			} as any)
			prismaMock.couponUsage.count.mockResolvedValue(0)
			await validatePromoCode(
				mockReq({ code: 'promo10', orderTotal: 100000 }) as Request,
				mockRes as Response,
			)
			expect(mockStatus).toHaveBeenCalledWith(200)
			expect(mockJson).toHaveBeenCalledWith({
				success: true,
				valid: true,
				message: 'Valid',
				data: {
					couponId: 'c1',
					code: 'PROMO10',
					discountAmount: 10000,
					discountType: 'PERCENT',
					discountValue: 10,
				},
			})
		})

		it('returns valid: true with discount for FIXED coupon', async () => {
			prismaMock.coupon.findUnique.mockResolvedValue({
				id: 'c2',
				code: 'FIXED5K',
				isActive: true,
				startsAt: null,
				endsAt: null,
				minOrderTotal: 20000,
				usageLimit: null,
				perUserLimit: null,
				discountType: 'FIXED',
				discountValue: 5000,
			} as any)
			prismaMock.couponUsage.count.mockResolvedValue(0)
			await validatePromoCode(
				mockReq({ code: 'fixed5k', orderTotal: 50000 }) as Request,
				mockRes as Response,
			)
			expect(mockStatus).toHaveBeenCalledWith(200)
			expect(mockJson).toHaveBeenCalledWith({
				success: true,
				valid: true,
				message: 'Valid',
				data: {
					couponId: 'c2',
					code: 'FIXED5K',
					discountAmount: 5000,
					discountType: 'FIXED',
					discountValue: 5000,
				},
			})
		})
	})
})
