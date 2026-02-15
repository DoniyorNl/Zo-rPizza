// backend/tests/unit/controllers/profile.controller.test.ts
// 🍕 PROFILE CONTROLLER TESTS (getProfileStats, getAddresses, createAddress, updateAddress, deleteAddress)

import { Request, Response } from 'express'
import {
	getProfileStats,
	getAddresses,
	createAddress,
	updateAddress,
	deleteAddress,
} from '@/controllers/profile.controller'
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

const mockUser = (overrides = {}) => ({
	id: 'user-1',
	email: 'test@example.com',
	name: 'Test User',
	phone: '+998901234567',
	avatar: null,
	dateOfBirth: null,
	gender: null,
	loyaltyPoints: 0,
	totalSpent: 0,
	memberSince: new Date(),
	createdAt: new Date(),
	dietaryPrefs: null,
	allergyInfo: null,
	favoriteProducts: null,
	...overrides,
})

describe('Profile Controller', () => {
	describe('getProfileStats', () => {
		it('should return 401 when userId missing', async () => {
			const req = mockRequest()
			const res = mockResponse()

			await getProfileStats(req as Request, res as Response)

			expect(res.status).toHaveBeenCalledWith(401)
			expect(res.json).toHaveBeenCalledWith({
				success: false,
				message: 'Authentication required',
			})
		})

		it('should return 404 when user not found', async () => {
			prismaMock.user.findUnique.mockResolvedValue(null)
			const req = mockRequest({ userId: 'fb-uid' } as any)
			const res = mockResponse()

			await getProfileStats(req as Request, res as Response)

			expect(res.status).toHaveBeenCalledWith(404)
			expect(res.json).toHaveBeenCalledWith({ success: false, message: 'User not found' })
		})

		it('should return profile with stats when user exists', async () => {
			const user = mockUser()
			prismaMock.user.findUnique.mockResolvedValue(user as any)
			prismaMock.order.aggregate.mockResolvedValue({ _count: { id: 5 }, _sum: { totalPrice: 250000 } } as any)
			prismaMock.order.findMany.mockResolvedValue([])
			prismaMock.orderItem.groupBy.mockResolvedValue([])
			prismaMock.product.findMany.mockResolvedValue([])
			prismaMock.order.groupBy.mockResolvedValue([])

			const req = mockRequest({ userId: 'fb-uid' } as any)
			const res = mockResponse()

			await getProfileStats(req as Request, res as Response)

			expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
				where: { firebaseUid: 'fb-uid' },
				select: expect.any(Object),
			})
			expect(res.status).toHaveBeenCalledWith(200)
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					data: expect.objectContaining({
						user: expect.any(Object),
						statistics: expect.any(Object),
						recentOrders: expect.any(Array),
						favoriteProducts: expect.any(Array),
					}),
				}),
			)
		})

		it('should return 500 on database error', async () => {
			prismaMock.user.findUnique.mockRejectedValue(new Error('DB error'))
			const req = mockRequest({ userId: 'fb-uid' } as any)
			const res = mockResponse()

			await getProfileStats(req as Request, res as Response)

			expect(res.status).toHaveBeenCalledWith(500)
		})
	})

	describe('getAddresses', () => {
		it('should return 401 when userId missing', async () => {
			const req = mockRequest()
			const res = mockResponse()

			await getAddresses(req as Request, res as Response)

			expect(res.status).toHaveBeenCalledWith(401)
		})

		it('should return 404 when user not found', async () => {
			prismaMock.user.findUnique.mockResolvedValue(null)
			const req = mockRequest({ userId: 'fb-uid' } as any)
			const res = mockResponse()

			await getAddresses(req as Request, res as Response)

			expect(res.status).toHaveBeenCalledWith(404)
		})

		it('should return addresses list', async () => {
			const user = generateMockUser({ id: 'user-1' })
			const addresses = [
				{
					id: 'addr-1',
					userId: 'user-1',
					label: 'Uy',
					street: 'Street 1',
					building: '1',
					apartment: null,
					floor: null,
					entrance: null,
					landmark: null,
					lat: null,
					lng: null,
					isDefault: true,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			]
			prismaMock.user.findUnique.mockResolvedValue(user as any)
			prismaMock.address.findMany.mockResolvedValue(addresses as any)

			const req = mockRequest({ userId: 'fb-uid' } as any)
			const res = mockResponse()

			await getAddresses(req as Request, res as Response)

			expect(res.status).toHaveBeenCalledWith(200)
			expect(res.json).toHaveBeenCalledWith({ success: true, data: addresses })
		})
	})

	describe('createAddress', () => {
		it('should return 401 when userId missing', async () => {
			const req = mockRequest({ body: { label: 'Uy', street: 'Street' } })
			const res = mockResponse()

			await createAddress(req as Request, res as Response)

			expect(res.status).toHaveBeenCalledWith(401)
		})

		it('should return 400 when label or street missing', async () => {
			const user = generateMockUser()
			prismaMock.user.findUnique.mockResolvedValue(user as any)
			const req = mockRequest({ userId: 'fb-uid', body: { street: 'Street' } } as any)
			const res = mockResponse()

			await createAddress(req as Request, res as Response)

			expect(res.status).toHaveBeenCalledWith(400)
			expect(res.json).toHaveBeenCalledWith({
				success: false,
				message: 'Label and street are required',
			})
		})

		it('should create address and return 201', async () => {
			const user = generateMockUser({ id: 'user-1' })
			const created = {
				id: 'addr-new',
				userId: 'user-1',
				label: 'Uy',
				street: 'Street 1',
				building: null,
				apartment: null,
				floor: null,
				entrance: null,
				landmark: null,
				lat: null,
				lng: null,
				isDefault: false,
				createdAt: new Date(),
				updatedAt: new Date(),
			}
			prismaMock.user.findUnique.mockResolvedValue(user as any)
			prismaMock.address.updateMany.mockResolvedValue({ count: 0 } as any)
			prismaMock.address.create.mockResolvedValue(created as any)

			const req = mockRequest({
				userId: 'fb-uid',
				body: { label: 'Uy', street: 'Street 1' },
			} as any)
			const res = mockResponse()

			await createAddress(req as Request, res as Response)

			expect(prismaMock.address.create).toHaveBeenCalled()
			expect(res.status).toHaveBeenCalledWith(201)
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({ success: true, data: expect.any(Object) }),
			)
		})
	})

	describe('updateAddress', () => {
		it('should return 404 when address not found', async () => {
			const user = generateMockUser({ id: 'user-1' })
			prismaMock.user.findUnique.mockResolvedValue(user as any)
			prismaMock.address.findFirst.mockResolvedValue(null)

			const req = mockRequest({
				userId: 'fb-uid',
				params: { id: 'addr-1' },
				body: { label: 'Ish' },
			} as any)
			const res = mockResponse()

			await updateAddress(req as Request, res as Response)

			expect(res.status).toHaveBeenCalledWith(404)
			expect(res.json).toHaveBeenCalledWith({
				success: false,
				message: 'Address not found',
			})
		})

		it('should update address and return 200', async () => {
			const user = generateMockUser({ id: 'user-1' })
			const existing = {
				id: 'addr-1',
				userId: 'user-1',
				label: 'Uy',
				street: 'Street 1',
				building: null,
				apartment: null,
				floor: null,
				entrance: null,
				landmark: null,
				lat: null,
				lng: null,
				isDefault: false,
				createdAt: new Date(),
				updatedAt: new Date(),
			}
			prismaMock.user.findUnique.mockResolvedValue(user as any)
			prismaMock.address.findFirst.mockResolvedValue(existing as any)
			prismaMock.address.updateMany.mockResolvedValue({ count: 0 } as any)
			prismaMock.address.update.mockResolvedValue({ ...existing, label: 'Ish' } as any)

			const req = mockRequest({
				userId: 'fb-uid',
				params: { id: 'addr-1' },
				body: { label: 'Ish' },
			} as any)
			const res = mockResponse()

			await updateAddress(req as Request, res as Response)

			expect(res.status).toHaveBeenCalledWith(200)
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({ success: true, data: expect.any(Object) }),
			)
		})
	})

	describe('deleteAddress', () => {
		it('should return 404 when address not found', async () => {
			const user = generateMockUser({ id: 'user-1' })
			prismaMock.user.findUnique.mockResolvedValue(user as any)
			prismaMock.address.findFirst.mockResolvedValue(null)

			const req = mockRequest({ userId: 'fb-uid', params: { id: 'addr-1' } } as any)
			const res = mockResponse()

			await deleteAddress(req as Request, res as Response)

			expect(res.status).toHaveBeenCalledWith(404)
		})

		it('should delete address and return 200', async () => {
			const user = generateMockUser({ id: 'user-1' })
			const existing = {
				id: 'addr-1',
				userId: 'user-1',
				label: 'Uy',
				street: 'Street 1',
				building: null,
				apartment: null,
				floor: null,
				entrance: null,
				landmark: null,
				lat: null,
				lng: null,
				isDefault: false,
				createdAt: new Date(),
				updatedAt: new Date(),
			}
			prismaMock.user.findUnique.mockResolvedValue(user as any)
			prismaMock.address.findFirst.mockResolvedValue(existing as any)
			prismaMock.address.delete.mockResolvedValue(existing as any)

			const req = mockRequest({ userId: 'fb-uid', params: { id: 'addr-1' } } as any)
			const res = mockResponse()

			await deleteAddress(req as Request, res as Response)

			expect(prismaMock.address.delete).toHaveBeenCalledWith({ where: { id: 'addr-1' } })
			expect(res.status).toHaveBeenCalledWith(200)
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({ success: true, message: expect.any(String) }),
			)
		})
	})
})
