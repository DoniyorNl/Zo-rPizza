// backend/tests/unit/controllers/delivery.controller.test.ts
// 🍕 DELIVERY CONTROLLER TESTS

import { Request, Response } from 'express'
import { estimateDeliveryTime } from '@/controllers/delivery.controller'
import { prismaMock } from '../../setup'

const mockRequest = (overrides = {}): Partial<Request> => ({
	params: {},
	query: {},
	body: {},
	...overrides,
})

const mockResponse = (): Partial<Response> => ({
	status: jest.fn().mockReturnThis(),
	json: jest.fn().mockReturnThis(),
})

const generateMockBranch = (overrides = {}) => ({
	id: 'branch-1',
	name: 'Filial 1',
	address: 'Toshkent',
	lat: 41.2995,
	lng: 69.2401,
	phone: null,
	isActive: true,
	createdAt: new Date(),
	updatedAt: new Date(),
	...overrides,
})

describe('Delivery Controller', () => {
	describe('estimateDeliveryTime', () => {
		it('should return 400 when lat/lng and address all missing', async () => {
			const req = mockRequest({ body: {}, query: {} })
			const res = mockResponse()

			await estimateDeliveryTime(req as Request, res as Response)

			expect(res.status).toHaveBeenCalledWith(400)
			expect(res.json).toHaveBeenCalledWith({
				success: false,
				message: 'Provide lat & lng or address for estimation',
			})
		})

		it('should return estimate with branch when lat/lng provided', async () => {
			const branches = [generateMockBranch()]
			prismaMock.branch.findMany.mockResolvedValue(branches as any)

			const req = mockRequest({ body: { lat: 41.3, lng: 69.24 } })
			const res = mockResponse()

			await estimateDeliveryTime(req as Request, res as Response)

			expect(prismaMock.branch.findMany).toHaveBeenCalledWith({ where: { isActive: true } })
			expect(res.status).toHaveBeenCalledWith(200)
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					data: expect.objectContaining({
						estimatedMinutes: expect.any(Number),
						branchId: 'branch-1',
						branchName: 'Filial 1',
						distanceKm: expect.any(Number),
					}),
				}),
			)
		})

		it('should return default 30 min when no branches exist', async () => {
			prismaMock.branch.findMany.mockResolvedValue([])

			const req = mockRequest({ body: { lat: 41.3, lng: 69.24 } })
			const res = mockResponse()

			await estimateDeliveryTime(req as Request, res as Response)

			expect(res.status).toHaveBeenCalledWith(200)
			expect(res.json).toHaveBeenCalledWith({
				success: true,
				data: {
					estimatedMinutes: 30,
					branchId: null,
					distanceKm: null,
				},
			})
		})

		it('should use address path and default branch when only address given', async () => {
			const branches = [generateMockBranch()]
			prismaMock.branch.findMany
				.mockResolvedValueOnce(branches as any)
				.mockResolvedValueOnce(branches as any)

			const req = mockRequest({ body: { address: 'Toshkent, Yunusobod' } })
			const res = mockResponse()

			await estimateDeliveryTime(req as Request, res as Response)

			expect(res.status).toHaveBeenCalledWith(200)
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					data: expect.objectContaining({
						estimatedMinutes: expect.any(Number),
						branchId: expect.any(String),
						branchName: expect.any(String),
						distanceKm: expect.any(Number),
					}),
				}),
			)
		})

		it('should return 200 with default message when address only and no branches', async () => {
			prismaMock.branch.findMany.mockResolvedValue([])

			const req = mockRequest({ body: { address: 'Some address' } })
			const res = mockResponse()

			await estimateDeliveryTime(req as Request, res as Response)

			expect(res.status).toHaveBeenCalledWith(200)
			expect(res.json).toHaveBeenCalledWith({
				success: true,
				data: { estimatedMinutes: 30, message: 'Default estimate (no branches)' },
			})
		})

		it('should return 500 on database error', async () => {
			prismaMock.branch.findMany.mockRejectedValue(new Error('DB error'))
			const req = mockRequest({ body: { lat: 41.3, lng: 69.24 } })
			const res = mockResponse()

			await estimateDeliveryTime(req as Request, res as Response)

			expect(res.status).toHaveBeenCalledWith(500)
			expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Server error' })
		})
	})
})
