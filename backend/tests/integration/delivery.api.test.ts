// =====================================
// 📁 FILE PATH: backend/tests/integration/delivery.api.test.ts
// 🧪 DELIVERY API INTEGRATION TESTS (Controller-level)
// Reja: Faza 1.1 - Backend delivery integration test
// =====================================

import { Request, Response } from 'express'
import { estimateDeliveryTime } from '../../src/controllers/delivery.controller'
import { prismaMock } from '../setup'

const generateMockBranch = (overrides = {}) => ({
	id: 'branch-1',
	name: 'Filial Chilonzor',
	address: 'Toshkent, Chilonzor',
	lat: 41.2995,
	lng: 69.2401,
	phone: '+998901234567',
	isActive: true,
	createdAt: new Date(),
	updatedAt: new Date(),
	...overrides,
})

describe('Delivery API Integration Tests (Controller-level)', () => {
	let mockReq: Partial<Request>
	let mockRes: Partial<Response>
	let mockJson: jest.Mock
	let mockStatus: jest.Mock

	beforeEach(() => {
		mockJson = jest.fn()
		mockStatus = jest.fn().mockReturnValue({ json: mockJson })
		mockReq = {
			query: {},
			body: {},
			params: {},
		}
		mockRes = {
			status: mockStatus,
			json: mockJson,
		}
	})

	describe('POST /api/delivery/estimate', () => {
		it('should return estimated minutes with lat/lng', async () => {
			const branches = [
				generateMockBranch({ id: 'b1', lat: 41.3, lng: 69.24 }),
				generateMockBranch({ id: 'b2', name: 'Filial 2', lat: 41.35, lng: 69.28 }),
			]
			prismaMock.branch.findMany.mockResolvedValue(branches as any)
			mockReq.body = { lat: 41.2995, lng: 69.2401 }

			await estimateDeliveryTime(mockReq as Request, mockRes as Response)

			expect(mockStatus).toHaveBeenCalledWith(200)
			expect(mockJson).toHaveBeenCalledWith({
				success: true,
				data: expect.objectContaining({
					estimatedMinutes: expect.any(Number),
					branchId: expect.any(String),
					branchName: expect.any(String),
					distanceKm: expect.any(Number),
				}),
			})
		})

		it('should return 400 when lat/lng and address both missing', async () => {
			mockReq.body = {}
			mockReq.query = {}

			await estimateDeliveryTime(mockReq as Request, mockRes as Response)

			expect(mockStatus).toHaveBeenCalledWith(400)
			expect(mockJson).toHaveBeenCalledWith({
				success: false,
				message: 'Provide lat & lng or address for estimation',
			})
		})

		it('should work with query params lat/lng', async () => {
			const branches = [generateMockBranch()]
			prismaMock.branch.findMany.mockResolvedValue(branches as any)
			mockReq.query = { lat: '41.3', lng: '69.24' }

			await estimateDeliveryTime(mockReq as Request, mockRes as Response)

			expect(mockStatus).toHaveBeenCalledWith(200)
			expect(mockJson).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					data: expect.objectContaining({ estimatedMinutes: expect.any(Number) }),
				}),
			)
		})

		it('should return default when no branches (address only)', async () => {
			prismaMock.branch.findMany.mockResolvedValue([])
			mockReq.body = { address: 'Toshkent, Amir Temur 1' }

			await estimateDeliveryTime(mockReq as Request, mockRes as Response)

			expect(mockStatus).toHaveBeenCalledWith(200)
			expect(mockJson).toHaveBeenCalledWith({
				success: true,
				data: expect.objectContaining({
					estimatedMinutes: 30,
					message: 'Default estimate (no branches)',
				}),
			})
		})

		it('should handle database error', async () => {
			prismaMock.branch.findMany.mockRejectedValue(new Error('DB error'))
			mockReq.body = { lat: 41.3, lng: 69.24 }

			await estimateDeliveryTime(mockReq as Request, mockRes as Response)

			expect(mockStatus).toHaveBeenCalledWith(500)
			expect(mockJson).toHaveBeenCalledWith(
				expect.objectContaining({ success: false, message: expect.any(String) }),
			)
		})
	})
})
