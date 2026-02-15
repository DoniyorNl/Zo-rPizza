// =====================================
// 📁 FILE PATH: backend/tests/integration/profile.api.test.ts
// 🧪 PROFILE API INTEGRATION TESTS (Addresses CRUD)
// Reja: Faza 1.1 - Backend profile integration test
// =====================================

import { Request, Response } from 'express'
import {
	getAddresses,
	createAddress,
	updateAddress,
	deleteAddress,
} from '../../src/controllers/profile.controller'
import { prismaMock, generateMockUser } from '../setup'

const generateMockAddress = (overrides = {}) => ({
	id: 'addr-1',
	userId: 'user-1',
	label: 'Uy',
	street: 'Amir Temur ko\'chasi',
	building: '1',
	apartment: '10',
	floor: null,
	entrance: null,
	landmark: null,
	lat: 41.2995,
	lng: 69.2401,
	isDefault: true,
	createdAt: new Date(),
	updatedAt: new Date(),
	...overrides,
})

const mockAuthReq = (userId = 'test-firebase-uid') => ({
	userId,
})

describe('Profile API Integration Tests (Addresses CRUD)', () => {
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
			...mockAuthReq(),
		}
		mockRes = {
			status: mockStatus,
			json: mockJson,
		}
	})

	describe('GET /api/profile/addresses', () => {
		it('should return 401 when not authenticated', async () => {
			;(mockReq as any).userId = undefined

			await getAddresses(mockReq as Request, mockRes as Response)

			expect(mockStatus).toHaveBeenCalledWith(401)
			expect(mockJson).toHaveBeenCalledWith({
				success: false,
				message: 'Authentication required',
			})
		})

		it('should return addresses for user', async () => {
			const user = generateMockUser({ id: 'user-1', firebaseUid: 'fb-uid' })
			const addresses = [
				generateMockAddress({ id: 'addr-1' }),
				generateMockAddress({ id: 'addr-2', label: 'Ish' }),
			]
			prismaMock.user.findUnique.mockResolvedValue(user as any)
			prismaMock.address.findMany.mockResolvedValue(addresses as any)
			;(mockReq as any).userId = 'fb-uid'

			await getAddresses(mockReq as Request, mockRes as Response)

			expect(mockStatus).toHaveBeenCalledWith(200)
			expect(mockJson).toHaveBeenCalledWith({ success: true, data: addresses })
			expect(prismaMock.address.findMany).toHaveBeenCalledWith({
				where: { userId: 'user-1' },
				orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
			})
		})

		it('should return 404 when user not found', async () => {
			prismaMock.user.findUnique.mockResolvedValue(null)
			;(mockReq as any).userId = 'nonexistent'

			await getAddresses(mockReq as Request, mockRes as Response)

			expect(mockStatus).toHaveBeenCalledWith(404)
			expect(mockJson).toHaveBeenCalledWith({ success: false, message: 'User not found' })
		})
	})

	describe('POST /api/profile/addresses', () => {
		it('should create address with valid data', async () => {
			const user = generateMockUser({ id: 'user-1', firebaseUid: 'fb-uid' })
			const newAddr = {
				label: 'Ofis',
				street: 'Navoiy ko\'chasi 5',
				building: '2',
				apartment: null,
				lat: 41.31,
				lng: 69.28,
			}
			mockReq.body = newAddr
			;(mockReq as any).userId = 'fb-uid'

			const created = generateMockAddress({ ...newAddr, id: 'addr-new' })
			prismaMock.user.findUnique.mockResolvedValue(user as any)
			prismaMock.address.updateMany.mockResolvedValue({ count: 0 } as any)
			prismaMock.address.create.mockResolvedValue(created as any)

			await createAddress(mockReq as Request, mockRes as Response)

			expect(mockStatus).toHaveBeenCalledWith(201)
			expect(mockJson).toHaveBeenCalledWith({
				success: true,
				message: 'Address created successfully',
				data: created,
			})
			expect(prismaMock.address.create).toHaveBeenCalledWith({
				data: expect.objectContaining({
					userId: 'user-1',
					label: 'Ofis',
					street: "Navoiy ko'chasi 5",
					building: '2',
					lat: 41.31,
					lng: 69.28,
				}),
			})
		})

		it('should return 400 when label missing', async () => {
			mockReq.body = { street: 'Test ko\'cha', building: '1' }
			;(mockReq as any).userId = 'fb-uid'
			const user = generateMockUser()
			prismaMock.user.findUnique.mockResolvedValue(user as any)

			await createAddress(mockReq as Request, mockRes as Response)

			expect(mockStatus).toHaveBeenCalledWith(400)
			expect(mockJson).toHaveBeenCalledWith({
				success: false,
				message: 'Label and street are required',
			})
		})
	})

	describe('PUT /api/profile/addresses/:id', () => {
		it('should update address', async () => {
			const user = generateMockUser({ id: 'user-1' })
			const existing = generateMockAddress({ id: 'addr-1', userId: 'user-1' })
			const updated = { ...existing, label: 'Yangi Uy', street: 'Yangi ko\'cha' }
			mockReq.params = { id: 'addr-1' }
			mockReq.body = { label: 'Yangi Uy', street: 'Yangi ko\'cha' }
			;(mockReq as any).userId = 'fb-uid'

			prismaMock.user.findUnique.mockResolvedValue(user as any)
			prismaMock.address.findFirst.mockResolvedValue(existing as any)
			prismaMock.address.update.mockResolvedValue(updated as any)

			await updateAddress(mockReq as Request, mockRes as Response)

			expect(mockStatus).toHaveBeenCalledWith(200)
			expect(mockJson).toHaveBeenCalledWith({
				success: true,
				message: 'Address updated successfully',
				data: updated,
			})
		})

		it('should return 404 when address not found or not owned', async () => {
			const user = generateMockUser({ id: 'user-1' })
			prismaMock.user.findUnique.mockResolvedValue(user as any)
			prismaMock.address.findFirst.mockResolvedValue(null)
			mockReq.params = { id: 'addr-foreign' }
			mockReq.body = { label: 'Test' }
			;(mockReq as any).userId = 'fb-uid'

			await updateAddress(mockReq as Request, mockRes as Response)

			expect(mockStatus).toHaveBeenCalledWith(404)
			expect(mockJson).toHaveBeenCalledWith({ success: false, message: 'Address not found' })
		})
	})

	describe('DELETE /api/profile/addresses/:id', () => {
		it('should delete address', async () => {
			const user = generateMockUser({ id: 'user-1' })
			const existing = generateMockAddress({ id: 'addr-1', userId: 'user-1' })
			mockReq.params = { id: 'addr-1' }
			;(mockReq as any).userId = 'fb-uid'

			prismaMock.user.findUnique.mockResolvedValue(user as any)
			prismaMock.address.findFirst.mockResolvedValue(existing as any)
			prismaMock.address.delete.mockResolvedValue(existing as any)

			await deleteAddress(mockReq as Request, mockRes as Response)

			expect(mockStatus).toHaveBeenCalledWith(200)
			expect(mockJson).toHaveBeenCalledWith({
				success: true,
				message: 'Address deleted successfully',
			})
			expect(prismaMock.address.delete).toHaveBeenCalledWith({ where: { id: 'addr-1' } })
		})

		it('should return 404 when address not found', async () => {
			const user = generateMockUser({ id: 'user-1' })
			prismaMock.user.findUnique.mockResolvedValue(user as any)
			prismaMock.address.findFirst.mockResolvedValue(null)
			mockReq.params = { id: 'addr-nonexistent' }
			;(mockReq as any).userId = 'fb-uid'

			await deleteAddress(mockReq as Request, mockRes as Response)

			expect(mockStatus).toHaveBeenCalledWith(404)
			expect(prismaMock.address.delete).not.toHaveBeenCalled()
		})
	})
})
