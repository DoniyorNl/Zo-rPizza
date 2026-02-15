// =====================================
// 📁 FILE PATH: backend/tests/integration/branches.api.test.ts
// 🧪 BRANCHES API INTEGRATION TESTS (Controller-level)
// Reja: Faza 1.1 - Backend branches integration test
// =====================================

import { Request, Response } from 'express'
import {
	getAllBranches,
	getBranchById,
	getNearestBranch,
	createBranch,
	updateBranch,
	deleteBranch,
} from '../../src/controllers/branches.controller'
import { prismaMock } from '../setup'

const generateMockBranch = (overrides = {}) => ({
	id: 'branch-1',
	name: 'Filial Chilonzor',
	address: 'Toshkent, Chilonzor 9',
	lat: 41.2995,
	lng: 69.2401,
	phone: '+998901234567',
	isActive: true,
	createdAt: new Date(),
	updatedAt: new Date(),
	...overrides,
})

describe('Branches API Integration Tests (Controller-level)', () => {
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

	describe('GET /api/branches', () => {
		it('should return 200 and list of active branches', async () => {
			const branches = [
				generateMockBranch({ id: 'b1', name: 'Filial 1' }),
				generateMockBranch({ id: 'b2', name: 'Filial 2' }),
			]
			prismaMock.branch.findMany.mockResolvedValue(branches as any)

			await getAllBranches(mockReq as Request, mockRes as Response)

			expect(mockStatus).toHaveBeenCalledWith(200)
			expect(mockJson).toHaveBeenCalledWith({
				success: true,
				count: 2,
				data: branches,
			})
			expect(prismaMock.branch.findMany).toHaveBeenCalledWith({
				where: { isActive: true },
				orderBy: { name: 'asc' },
			})
		})
	})

	describe('GET /api/branches/nearest', () => {
		it('should return nearest branch with distance', async () => {
			const branches = [
				generateMockBranch({ id: 'b1', lat: 41.3, lng: 69.24 }),
				generateMockBranch({ id: 'b2', name: 'Filial 2', lat: 41.31, lng: 69.25 }),
			]
			prismaMock.branch.findMany.mockResolvedValue(branches as any)
			mockReq.query = { lat: '41.2995', lng: '69.2401' }

			await getNearestBranch(mockReq as Request, mockRes as Response)

			expect(mockStatus).toHaveBeenCalledWith(200)
			expect(mockJson).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					data: expect.objectContaining({ id: 'b1', distanceKm: expect.any(Number) }),
					alternatives: expect.any(Array),
				}),
			)
		})

		it('should return 400 when lat/lng missing', async () => {
			mockReq.query = {}

			await getNearestBranch(mockReq as Request, mockRes as Response)

			expect(mockStatus).toHaveBeenCalledWith(400)
			expect(mockJson).toHaveBeenCalledWith({
				success: false,
				message: 'Valid lat and lng required',
			})
		})
	})

	describe('GET /api/branches/:id', () => {
		it('should return branch by id', async () => {
			const branch = generateMockBranch({ id: 'branch-99' })
			prismaMock.branch.findUnique.mockResolvedValue(branch as any)
			mockReq.params = { id: 'branch-99' }

			await getBranchById(mockReq as Request, mockRes as Response)

			expect(prismaMock.branch.findUnique).toHaveBeenCalledWith({ where: { id: 'branch-99' } })
			expect(mockStatus).toHaveBeenCalledWith(200)
			expect(mockJson).toHaveBeenCalledWith({ success: true, data: branch })
		})

		it('should return 404 when branch not found', async () => {
			prismaMock.branch.findUnique.mockResolvedValue(null)
			mockReq.params = { id: 'nonexistent' }

			await getBranchById(mockReq as Request, mockRes as Response)

			expect(mockStatus).toHaveBeenCalledWith(404)
			expect(mockJson).toHaveBeenCalledWith({ success: false, message: 'Branch not found' })
		})
	})

	describe('POST /api/branches', () => {
		it('should create branch with valid data', async () => {
			const newBranch = {
				name: 'Yangi Filial',
				address: 'Toshkent, Yunusobod 5',
				lat: 41.35,
				lng: 69.28,
				phone: '+998901112233',
			}
			mockReq.body = newBranch

			const created = generateMockBranch({ ...newBranch, id: 'new-branch-id' })
			prismaMock.branch.create.mockResolvedValue(created as any)

			await createBranch(mockReq as Request, mockRes as Response)

			expect(mockStatus).toHaveBeenCalledWith(201)
			expect(mockJson).toHaveBeenCalledWith({ success: true, data: created })
			expect(prismaMock.branch.create).toHaveBeenCalledWith({
				data: {
					name: 'Yangi Filial',
					address: 'Toshkent, Yunusobod 5',
					lat: 41.35,
					lng: 69.28,
					phone: '+998901112233',
					isActive: true,
				},
			})
		})

		it('should return 400 when name missing', async () => {
			mockReq.body = {
				address: 'Toshkent',
				lat: 41.3,
				lng: 69.24,
			}

			await createBranch(mockReq as Request, mockRes as Response)

			expect(mockStatus).toHaveBeenCalledWith(400)
			expect(mockJson).toHaveBeenCalledWith({
				success: false,
				message: 'name, address, lat, lng majburiy',
			})
		})

		it('should return 400 when lat/lng invalid', async () => {
			mockReq.body = {
				name: 'Test',
				address: 'Toshkent',
				lat: 'invalid',
				lng: 69.24,
			}

			await createBranch(mockReq as Request, mockRes as Response)

			expect(mockStatus).toHaveBeenCalledWith(400)
			expect(mockJson).toHaveBeenCalledWith({
				success: false,
				message: expect.stringContaining('lat va lng raqam'),
			})
		})
	})

	describe('PATCH /api/branches/:id', () => {
		it('should update branch', async () => {
			const existing = generateMockBranch({ id: 'branch-1' })
			const updated = { ...existing, name: 'Yangilangan Filial', address: 'Yangi manzil' }
			prismaMock.branch.findUnique.mockResolvedValue(existing as any)
			prismaMock.branch.update.mockResolvedValue(updated as any)
			mockReq.params = { id: 'branch-1' }
			mockReq.body = { name: 'Yangilangan Filial', address: 'Yangi manzil' }

			await updateBranch(mockReq as Request, mockRes as Response)

			expect(mockStatus).toHaveBeenCalledWith(200)
			expect(mockJson).toHaveBeenCalledWith({ success: true, data: updated })
			expect(prismaMock.branch.update).toHaveBeenCalledWith(
				expect.objectContaining({
					where: { id: 'branch-1' },
					data: expect.objectContaining({ name: 'Yangilangan Filial', address: 'Yangi manzil' }),
				}),
			)
		})

		it('should return 404 when branch not found', async () => {
			prismaMock.branch.findUnique.mockResolvedValue(null)
			mockReq.params = { id: 'nonexistent' }
			mockReq.body = { name: 'Test' }

			await updateBranch(mockReq as Request, mockRes as Response)

			expect(mockStatus).toHaveBeenCalledWith(404)
			expect(mockJson).toHaveBeenCalledWith({ success: false, message: 'Branch not found' })
		})

		it('should update isActive', async () => {
			const existing = generateMockBranch({ id: 'b1', isActive: true })
			const updated = { ...existing, isActive: false }
			prismaMock.branch.findUnique.mockResolvedValue(existing as any)
			prismaMock.branch.update.mockResolvedValue(updated as any)
			mockReq.params = { id: 'b1' }
			mockReq.body = { isActive: false }

			await updateBranch(mockReq as Request, mockRes as Response)

			expect(mockStatus).toHaveBeenCalledWith(200)
			expect(prismaMock.branch.update).toHaveBeenCalledWith(
				expect.objectContaining({
					data: expect.objectContaining({ isActive: false }),
				}),
			)
		})
	})

	describe('DELETE /api/branches/:id', () => {
		it('should delete branch and unlink orders', async () => {
			const existing = generateMockBranch({ id: 'branch-1' })
			prismaMock.branch.findUnique.mockResolvedValue(existing as any)
			prismaMock.order.updateMany.mockResolvedValue({ count: 2 } as any)
			prismaMock.branch.delete.mockResolvedValue(existing as any)
			mockReq.params = { id: 'branch-1' }

			await deleteBranch(mockReq as Request, mockRes as Response)

			expect(prismaMock.order.updateMany).toHaveBeenCalledWith({
				where: { branchId: 'branch-1' },
				data: { branchId: null },
			})
			expect(prismaMock.branch.delete).toHaveBeenCalledWith({ where: { id: 'branch-1' } })
			expect(mockStatus).toHaveBeenCalledWith(200)
			expect(mockJson).toHaveBeenCalledWith({ success: true, message: "Filial o'chirildi" })
		})

		it('should return 404 when branch not found', async () => {
			prismaMock.branch.findUnique.mockResolvedValue(null)
			mockReq.params = { id: 'nonexistent' }

			await deleteBranch(mockReq as Request, mockRes as Response)

			expect(mockStatus).toHaveBeenCalledWith(404)
			expect(mockJson).toHaveBeenCalledWith({ success: false, message: 'Branch not found' })
			expect(prismaMock.branch.delete).not.toHaveBeenCalled()
		})
	})
})
