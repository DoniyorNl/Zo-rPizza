import { Request, Response } from 'express'
import { getBalance, getRedeemOptions, getTransactions } from '../../src/controllers/loyalty.controller'
import { prismaMock, generateMockUser } from '../setup'
import type { AuthRequest } from '../../src/middleware/firebase-auth.middleware'

const mockReq = (userId?: string): Partial<AuthRequest> =>
	({ userId: userId ?? 'firebase-uid-1' } as Partial<AuthRequest>)

describe('Loyalty API Integration', () => {
	let mockRes: Partial<Response>
	let mockJson: jest.Mock
	let mockStatus: jest.Mock

	beforeEach(() => {
		mockJson = jest.fn()
		mockStatus = jest.fn().mockReturnValue({ json: mockJson })
		mockRes = { status: mockStatus, json: mockJson }
	})

	describe('GET /api/loyalty/balance', () => {
		it('returns 401 when userId missing', async () => {
			const req = mockReq(undefined) as Request
			;(req as AuthRequest).userId = undefined
			await getBalance(req as Request, mockRes as Response)
			expect(mockStatus).toHaveBeenCalledWith(401)
			expect(mockJson).toHaveBeenCalledWith({ success: false, message: 'Unauthorized' })
		})

		it('returns points 0 when user not found', async () => {
			prismaMock.user.findFirst.mockResolvedValue(null)
			await getBalance(mockReq() as Request, mockRes as Response)
			expect(mockStatus).toHaveBeenCalledWith(200)
			expect(mockJson).toHaveBeenCalledWith({ success: true, data: { points: 0, totalSpent: 0 } })
		})

		it('returns balance and redeemableDiscount for user', async () => {
			const user = generateMockUser({
				id: 'db-user-1',
				firebaseUid: 'firebase-uid-1',
				loyaltyPoints: 250,
				totalSpent: 500000,
			})
			prismaMock.user.findFirst.mockResolvedValue(user as any)
			await getBalance(mockReq() as Request, mockRes as Response)
			expect(mockStatus).toHaveBeenCalledWith(200)
			expect(mockJson).toHaveBeenCalledWith({
				success: true,
				data: {
					points: 250,
					totalSpent: 500000,
					redeemableDiscount: 2,
				},
			})
		})
	})

	describe('GET /api/loyalty/redeem-options', () => {
		it('returns 401 when userId missing', async () => {
			const req = mockReq(undefined) as Request
			;(req as AuthRequest).userId = undefined
			await getRedeemOptions(req as Request, mockRes as Response)
			expect(mockStatus).toHaveBeenCalledWith(401)
		})

		it('returns maxDiscount 0 when user not found', async () => {
			prismaMock.user.findFirst.mockResolvedValue(null)
			await getRedeemOptions(mockReq() as Request, mockRes as Response)
			expect(mockStatus).toHaveBeenCalledWith(200)
			expect(mockJson).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					data: expect.objectContaining({ points: 0, maxDiscount: 0 }),
				}),
			)
		})

		it('returns points and maxDiscount for user', async () => {
			prismaMock.user.findFirst.mockResolvedValue({
				loyaltyPoints: 350,
			} as any)
			await getRedeemOptions(mockReq() as Request, mockRes as Response)
			expect(mockStatus).toHaveBeenCalledWith(200)
			expect(mockJson).toHaveBeenCalledWith({
				success: true,
				data: {
					points: 350,
					pointsPerCurrency: 100,
					maxDiscount: 3,
				},
			})
		})
	})

	describe('GET /api/loyalty/transactions', () => {
		it('returns 401 when userId missing', async () => {
			const req = mockReq(undefined) as Request
			;(req as AuthRequest).userId = undefined
			await getTransactions(req as Request, mockRes as Response)
			expect(mockStatus).toHaveBeenCalledWith(401)
		})

		it('returns empty array when user not found', async () => {
			prismaMock.user.findFirst.mockResolvedValue(null)
			await getTransactions(mockReq() as Request, mockRes as Response)
			expect(mockStatus).toHaveBeenCalledWith(200)
			expect(mockJson).toHaveBeenCalledWith({ success: true, data: [] })
		})

		it('returns transactions for user', async () => {
			prismaMock.user.findFirst.mockResolvedValue({ id: 'user-1' } as any)
			const tx = [
				{ id: 'tx-1', userId: 'user-1', points: 10, type: 'EARN', orderId: 'ord-1', createdAt: new Date() },
			]
			prismaMock.loyaltyTransaction.findMany.mockResolvedValue(tx as any)
			await getTransactions(mockReq() as Request, mockRes as Response)
			expect(mockStatus).toHaveBeenCalledWith(200)
			expect(mockJson).toHaveBeenCalledWith({ success: true, data: tx })
		})
	})
})
