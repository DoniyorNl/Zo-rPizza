// backend/tests/unit/controllers/branches.controller.test.ts
// 🍕 BRANCHES CONTROLLER TESTS

import { Request, Response } from 'express'
import { getAllBranches, getNearestBranch, getBranchById } from '@/controllers/branches.controller'
import { prismaMock } from '../../setup'

const mockRequest = (overrides = {}): Partial<Request> => ({
	params: {},
	query: {},
	...overrides,
})

const mockResponse = (): Partial<Response> => ({
	status: jest.fn().mockReturnThis(),
	json: jest.fn().mockReturnThis(),
})

const generateMockBranch = (overrides = {}) => ({
	id: 'branch-1',
	name: 'Filial 1',
	address: 'Toshkent, Chilonzor',
	lat: 41.2995,
	lng: 69.2401,
	phone: '+998901234567',
	isActive: true,
	createdAt: new Date(),
	updatedAt: new Date(),
	...overrides,
})

describe('Branches Controller', () => {
	describe('getAllBranches', () => {
		it('should return all active branches', async () => {
			const req = mockRequest()
			const res = mockResponse()
			const branches = [generateMockBranch(), generateMockBranch({ id: 'branch-2', name: 'Filial 2' })]
			prismaMock.branch.findMany.mockResolvedValue(branches as any)

			await getAllBranches(req as Request, res as Response)

			expect(prismaMock.branch.findMany).toHaveBeenCalledWith({
				where: { isActive: true },
				orderBy: { name: 'asc' },
			})
			expect(res.status).toHaveBeenCalledWith(200)
			expect(res.json).toHaveBeenCalledWith({ success: true, count: 2, data: branches })
		})

		it('should return empty array when no branches', async () => {
			const req = mockRequest()
			const res = mockResponse()
			prismaMock.branch.findMany.mockResolvedValue([])

			await getAllBranches(req as Request, res as Response)

			expect(res.status).toHaveBeenCalledWith(200)
			expect(res.json).toHaveBeenCalledWith({ success: true, count: 0, data: [] })
		})

		it('should return 500 on database error', async () => {
			const req = mockRequest()
			const res = mockResponse()
			prismaMock.branch.findMany.mockRejectedValue(new Error('DB error'))

			await getAllBranches(req as Request, res as Response)

			expect(res.status).toHaveBeenCalledWith(500)
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({ success: false, message: expect.any(String) }),
			)
		})
	})

	describe('getNearestBranch', () => {
		it('should return 400 when lat/lng missing or invalid', async () => {
			const res = mockResponse()
			await getNearestBranch(mockRequest({ query: {} }) as Request, res as Response)
			expect(res.status).toHaveBeenCalledWith(400)
			expect(res.json).toHaveBeenCalledWith({
				success: false,
				message: 'Valid lat and lng required',
			})
		})

		it('should return 400 when lat out of range', async () => {
			const res = mockResponse()
			await getNearestBranch(
				mockRequest({ query: { lat: '100', lng: '69' } }) as Request,
				res as Response,
			)
			expect(res.status).toHaveBeenCalledWith(400)
		})

		it('should return nearest branch with distance and alternatives', async () => {
			const branches = [
				generateMockBranch({ id: 'b1', lat: 41.3, lng: 69.24 }),
				generateMockBranch({ id: 'b2', name: 'Filial 2', lat: 41.31, lng: 69.25 }),
			]
			prismaMock.branch.findMany.mockResolvedValue(branches as any)

			const req = mockRequest({ query: { lat: '41.2995', lng: '69.2401' } })
			const res = mockResponse()

			await getNearestBranch(req as Request, res as Response)

			expect(prismaMock.branch.findMany).toHaveBeenCalledWith({ where: { isActive: true } })
			expect(res.status).toHaveBeenCalledWith(200)
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					data: expect.objectContaining({ id: 'b1', distanceKm: expect.any(Number) }),
					alternatives: expect.any(Array),
				}),
			)
		})

		it('should return 200 with null data when no branches', async () => {
			prismaMock.branch.findMany.mockResolvedValue([])
			const req = mockRequest({ query: { lat: '41.3', lng: '69.24' } })
			const res = mockResponse()

			await getNearestBranch(req as Request, res as Response)

			expect(res.status).toHaveBeenCalledWith(200)
			expect(res.json).toHaveBeenCalledWith({
				success: true,
				data: null,
				message: 'No branches',
			})
		})

		it('should return 500 on database error', async () => {
			prismaMock.branch.findMany.mockRejectedValue(new Error('DB error'))
			const req = mockRequest({ query: { lat: '41.3', lng: '69.24' } })
			const res = mockResponse()

			await getNearestBranch(req as Request, res as Response)

			expect(res.status).toHaveBeenCalledWith(500)
		})
	})

	describe('getBranchById', () => {
		it('should return branch by id', async () => {
			const branch = generateMockBranch({ id: 'branch-99' })
			prismaMock.branch.findUnique.mockResolvedValue(branch as any)
			const req = mockRequest({ params: { id: 'branch-99' } })
			const res = mockResponse()

			await getBranchById(req as Request, res as Response)

			expect(prismaMock.branch.findUnique).toHaveBeenCalledWith({ where: { id: 'branch-99' } })
			expect(res.status).toHaveBeenCalledWith(200)
			expect(res.json).toHaveBeenCalledWith({ success: true, data: branch })
		})

		it('should return 404 when branch not found', async () => {
			prismaMock.branch.findUnique.mockResolvedValue(null)
			const req = mockRequest({ params: { id: 'nonexistent' } })
			const res = mockResponse()

			await getBranchById(req as Request, res as Response)

			expect(res.status).toHaveBeenCalledWith(404)
			expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Branch not found' })
		})

		it('should return 500 on database error', async () => {
			prismaMock.branch.findUnique.mockRejectedValue(new Error('DB error'))
			const req = mockRequest({ params: { id: 'branch-1' } })
			const res = mockResponse()

			await getBranchById(req as Request, res as Response)

			expect(res.status).toHaveBeenCalledWith(500)
		})
	})
})
