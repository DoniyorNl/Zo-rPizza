// backend/tests/unit/controllers/loyalty.controller.test.ts
// 🍕 LOYALTY CONTROLLER TESTS

import { Request, Response } from 'express'
import { getBalance, getRedeemOptions, getTransactions } from '@/controllers/loyalty.controller'
import { prismaMock } from '../../setup'
import { generateMockUser } from '../../setup'

const mockRequest = (overrides = {}): Partial<Request> => ({
	params: {},
	body: {},
	...overrides,
})

const mockResponse = (): Partial<Response> => ({
	status: jest.fn().mockReturnThis(),
	json: jest.fn().mockReturnThis(),
})

describe('Loyalty Controller', () => {
	describe('getBalance', () => {
		it('should return 401 when userId missing', async () => {
			const req = mockRequest()
			const res = mockResponse()

			await getBalance(req as Request, res as Response)

			expect(res.status).toHaveBeenCalledWith(401)
			expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Unauthorized' })
		})

		it('should return balance with points and redeemableDiscount', async () => {
			const user = generateMockUser({
				id: 'user-1',
				firebaseUid: 'fb-uid',
				loyaltyPoints: 500,
				totalSpent: 100000,
			} as any)
			prismaMock.user.findFirst.mockResolvedValue(user as any)

			const req = mockRequest({ userId: 'fb-uid' } as any)
			const res = mockResponse()

			await getBalance(req as Request, res as Response)

			expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
				where: { firebaseUid: 'fb-uid' },
				select: { id: true, loyaltyPoints: true, totalSpent: true },
			})
			expect(res.status).toHaveBeenCalledWith(200)
			expect(res.json).toHaveBeenCalledWith({
				success: true,
				data: {
					points: 500,
					totalSpent: 100000,
					redeemableDiscount: 5,
				},
			})
		})

		it('should return zero balance when user not in DB', async () => {
			prismaMock.user.findFirst.mockResolvedValue(null)
			const req = mockRequest({ userId: 'fb-uid' } as any)
			const res = mockResponse()

			await getBalance(req as Request, res as Response)

			expect(res.status).toHaveBeenCalledWith(200)
			expect(res.json).toHaveBeenCalledWith({
				success: true,
				data: { points: 0, totalSpent: 0 },
			})
		})

		it('should return 500 on database error', async () => {
			prismaMock.user.findFirst.mockRejectedValue(new Error('DB error'))
			const req = mockRequest({ userId: 'fb-uid' } as any)
			const res = mockResponse()

			await getBalance(req as Request, res as Response)

			expect(res.status).toHaveBeenCalledWith(500)
		})
	})

	describe('getRedeemOptions', () => {
		it('should return 401 when userId missing', async () => {
			const req = mockRequest()
			const res = mockResponse()

			await getRedeemOptions(req as Request, res as Response)

			expect(res.status).toHaveBeenCalledWith(401)
		})

		it('should return redeem options with points and maxDiscount', async () => {
			const user = generateMockUser({ loyaltyPoints: 250 } as any)
			prismaMock.user.findFirst.mockResolvedValue(user as any)

			const req = mockRequest({ userId: 'fb-uid' } as any)
			const res = mockResponse()

			await getRedeemOptions(req as Request, res as Response)

			expect(res.status).toHaveBeenCalledWith(200)
			expect(res.json).toHaveBeenCalledWith({
				success: true,
				data: {
					points: 250,
					pointsPerCurrency: 100,
					maxDiscount: 2,
				},
			})
		})

		it('should return 500 on database error', async () => {
			prismaMock.user.findFirst.mockRejectedValue(new Error('DB error'))
			const req = mockRequest({ userId: 'fb-uid' } as any)
			const res = mockResponse()

			await getRedeemOptions(req as Request, res as Response)

			expect(res.status).toHaveBeenCalledWith(500)
		})
	})

	describe('getTransactions', () => {
		it('should return 401 when userId missing', async () => {
			const req = mockRequest()
			const res = mockResponse()

			await getTransactions(req as Request, res as Response)

			expect(res.status).toHaveBeenCalledWith(401)
		})

		it('should return transactions list for user', async () => {
			const user = generateMockUser({ id: 'user-1' })
			const transactions = [
				{
					id: 'tx-1',
					userId: 'user-1',
					type: 'EARN' as const,
					points: 100,
					orderId: null,
					description: null,
					createdAt: new Date(),
				},
			]
			prismaMock.user.findFirst.mockResolvedValue(user as any)
			prismaMock.loyaltyTransaction.findMany.mockResolvedValue(transactions as any)

			const req = mockRequest({ userId: 'fb-uid' } as any)
			const res = mockResponse()

			await getTransactions(req as Request, res as Response)

			expect(prismaMock.loyaltyTransaction.findMany).toHaveBeenCalledWith({
				where: { userId: 'user-1' },
				orderBy: { createdAt: 'desc' },
				take: 50,
			})
			expect(res.status).toHaveBeenCalledWith(200)
			expect(res.json).toHaveBeenCalledWith({ success: true, data: transactions })
		})

		it('should return empty array when user not in DB', async () => {
			prismaMock.user.findFirst.mockResolvedValue(null)
			const req = mockRequest({ userId: 'fb-uid' } as any)
			const res = mockResponse()

			await getTransactions(req as Request, res as Response)

			expect(res.status).toHaveBeenCalledWith(200)
			expect(res.json).toHaveBeenCalledWith({ success: true, data: [] })
		})

		it('should return 500 on database error', async () => {
			prismaMock.user.findFirst.mockResolvedValue(generateMockUser() as any)
			prismaMock.loyaltyTransaction.findMany.mockRejectedValue(new Error('DB error'))
			const req = mockRequest({ userId: 'fb-uid' } as any)
			const res = mockResponse()

			await getTransactions(req as Request, res as Response)

			expect(res.status).toHaveBeenCalledWith(500)
		})
	})
})
