// backend/tests/unit/controllers/users.controller.expansion.test.ts
// 👥 USERS CONTROLLER - EXPANSION TESTS - Fixed Version

import { Request, Response } from 'express'
import { DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended'
import { Prisma } from '@prisma/client'
import prisma from '../../../src/lib/prisma'
import {
	createUser,
	getUserById,
	getAllUsers,
	updateUser,
	updateUserRole,
	updateUserStatus,
} from '../../../src/controllers/users.controller'

// ============================================================================
// MOCK SETUP
// ============================================================================

jest.mock('../../../src/lib/prisma', () => ({
	__esModule: true,
	default: mockDeep<typeof prisma>(),
}))

const prismaMock = prisma as unknown as DeepMockProxy<typeof prisma>

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const mockRequest = (overrides: any = {}): Partial<Request> => ({
	params: {},
	body: {},
	query: {},
	...overrides,
})

const mockResponse = (): Partial<Response> => {
	const res: Partial<Response> = {
		status: jest.fn().mockReturnThis(),
		json: jest.fn().mockReturnThis(),
	}
	return res
}

const generateMockUser = (overrides: any = {}) => ({
	id: 'user-123',
	email: 'test@example.com',
	name: 'Test User',
	phone: '+998901234567',
	password: 'FIREBASE_AUTH',
	role: 'CUSTOMER' as const,
	isBlocked: false,
	createdAt: new Date(),
	updatedAt: new Date(),
	...overrides,
})

// ============================================================================
// TESTS
// ============================================================================

describe('Users Controller - Advanced Coverage', () => {
	beforeEach(() => {
		mockReset(prismaMock)
		jest.clearAllMocks()
		jest.spyOn(console, 'log').mockImplementation()
		jest.spyOn(console, 'error').mockImplementation()
	})

	afterEach(() => {
		jest.restoreAllMocks()
	})

	// ========================================================================
	// createUser - Comprehensive Validation
	// ========================================================================
	describe('createUser - Validation & Edge Cases', () => {
		it('should validate email format', async () => {
			const req = mockRequest({
				body: {
					firebaseUid: 'firebase-123',
					email: 'invalid-email',
					name: 'Test User',
				},
			})
			const res = mockResponse()

			await createUser(req as Request, res as Response)

			expect(res.status).toHaveBeenCalledWith(400)
			expect(res.json).toHaveBeenCalledWith({
				success: false,
				message: 'Invalid email format',
			})
		})

		it('should validate phone format (Uzbekistan)', async () => {
			const req = mockRequest({
				body: {
					firebaseUid: 'firebase-123',
					email: 'test@example.com',
					phone: '123',
				},
			})
			const res = mockResponse()

			await createUser(req as Request, res as Response)

			expect(res.status).toHaveBeenCalledWith(400)
		})

		it('should accept valid Uzbekistan phone formats', async () => {
			const req = mockRequest({
				body: {
					firebaseUid: 'firebase-123',
					email: 'test@example.com',
					phone: '+998901234567',
				},
			})
			const res = mockResponse()

			const mockUser = generateMockUser()
			prismaMock.user.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(null)
			prismaMock.user.create.mockResolvedValue(mockUser as any)

			await createUser(req as Request, res as Response)

			expect(res.status).toHaveBeenCalledWith(201)
		})

		it('should return 200 if user already exists', async () => {
			const req = mockRequest({
				body: {
					firebaseUid: 'firebase-123',
					email: 'existing@example.com',
				},
			})
			const res = mockResponse()

			const existingUser = generateMockUser({ email: 'existing@example.com' })
			prismaMock.user.findUnique.mockResolvedValue(existingUser as any)

			await createUser(req as Request, res as Response)

			expect(res.status).toHaveBeenCalledWith(200)
		})

		it('should return 400 if email already in use', async () => {
			const req = mockRequest({
				body: {
					firebaseUid: 'firebase-new',
					email: 'taken@example.com',
				},
			})
			const res = mockResponse()

			prismaMock.user.findUnique
				.mockResolvedValueOnce(null)
				.mockResolvedValueOnce(generateMockUser({ email: 'taken@example.com' }) as any)

			await createUser(req as Request, res as Response)

			expect(res.status).toHaveBeenCalledWith(400)
		})

		it('should handle Prisma unique constraint error', async () => {
			const req = mockRequest({
				body: {
					firebaseUid: 'firebase-123',
					email: 'test@example.com',
				},
			})
			const res = mockResponse()

			const prismaError = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
				code: 'P2002',
				clientVersion: '5.0.0',
			})

			prismaMock.user.findUnique.mockResolvedValue(null)
			prismaMock.user.create.mockRejectedValue(prismaError)

			await createUser(req as Request, res as Response)

			expect(res.status).toHaveBeenCalledWith(400)
		})

		it('should normalize email to lowercase', async () => {
			const req = mockRequest({
				body: {
					firebaseUid: 'firebase-123',
					email: 'Test@EXAMPLE.COM',
				},
			})
			const res = mockResponse()

			prismaMock.user.findUnique.mockResolvedValue(null)
			prismaMock.user.create.mockResolvedValue(generateMockUser() as any)

			await createUser(req as Request, res as Response)

			expect(prismaMock.user.create).toHaveBeenCalledWith(
				expect.objectContaining({
					data: expect.objectContaining({
						email: 'test@example.com',
					}),
				}),
			)
		})
	})

	// ========================================================================
	// getUserById - Complete Coverage
	// ========================================================================
	describe('getUserById - Advanced Scenarios', () => {
		it('should return user with order count', async () => {
			const req = mockRequest({ params: { id: 'user-123' } })
			const res = mockResponse()

			const mockUser = {
				...generateMockUser(),
				_count: { orders: 5 },
			}
			prismaMock.user.findUnique.mockResolvedValue(mockUser as any)

			await getUserById(req as Request, res as Response)

			expect(res.status).toHaveBeenCalledWith(200)
		})

		it('should handle array ID parameter', async () => {
			const req = mockRequest({ params: { id: ['user-123'] } })
			const res = mockResponse()

			prismaMock.user.findUnique.mockResolvedValue(generateMockUser() as any)

			await getUserById(req as Request, res as Response)

			expect(prismaMock.user.findUnique).toHaveBeenCalled()
		})

		it('should return 400 for missing user ID', async () => {
			const req = mockRequest({ params: { id: '' } })
			const res = mockResponse()

			await getUserById(req as Request, res as Response)

			expect(res.status).toHaveBeenCalledWith(400)
		})
	})

	// ========================================================================
	// getAllUsers - Filtering & Pagination
	// ========================================================================
	describe('getAllUsers - Filtering', () => {
		it('should filter by role', async () => {
			const req = mockRequest({ query: { role: 'ADMIN' } })
			const res = mockResponse()

			const mockUsers = [generateMockUser({ role: 'ADMIN' })]
			prismaMock.user.findMany.mockResolvedValue(mockUsers as any)

			await getAllUsers(req as Request, res as Response)

			expect(prismaMock.user.findMany).toHaveBeenCalled()
		})

		it('should filter by isBlocked status', async () => {
			const req = mockRequest({ query: { isBlocked: 'true' } })
			const res = mockResponse()

			const mockUsers = [generateMockUser({ isBlocked: true })]
			prismaMock.user.findMany.mockResolvedValue(mockUsers as any)

			await getAllUsers(req as Request, res as Response)

			expect(prismaMock.user.findMany).toHaveBeenCalled()
		})

		it('should implement pagination', async () => {
			const req = mockRequest({
				query: { page: '2', limit: '10' },
			})
			const res = mockResponse()

			prismaMock.user.findMany.mockResolvedValue([])
			prismaMock.user.count.mockResolvedValue(25)

			await getAllUsers(req as Request, res as Response)

			expect(prismaMock.user.findMany).toHaveBeenCalled()
		})
	})

	// ========================================================================
	// updateUser - Complete Update Scenarios
	// ========================================================================
	describe('updateUser - Update Operations', () => {
		it('should update user successfully', async () => {
			const req = mockRequest({
				params: { id: 'user-123' },
				body: {
					name: 'Updated Name',
					phone: '+998901234567',
				},
			})
			const res = mockResponse()

			const mockUser = generateMockUser()
			const updatedUser = generateMockUser({ name: 'Updated Name' })

			prismaMock.user.findUnique.mockResolvedValue(mockUser as any)
			prismaMock.user.update.mockResolvedValue(updatedUser as any)

			await updateUser(req as Request, res as Response)

			expect(res.status).toHaveBeenCalledWith(200)
		})

		it('should return 404 if user not found', async () => {
			const req = mockRequest({
				params: { id: 'nonexistent' },
				body: { name: 'Test' },
			})
			const res = mockResponse()

			prismaMock.user.findUnique.mockResolvedValue(null)

			await updateUser(req as Request, res as Response)

			expect(res.status).toHaveBeenCalledWith(404)
		})
	})

	// ========================================================================
	// updateUserStatus - Block/Unblock
	// ========================================================================
	describe('updateUserStatus - Block Operations', () => {
		it('should block user', async () => {
			const req = mockRequest({
				params: { id: 'user-123' },
				body: { isBlocked: true },
			})
			const res = mockResponse()

			const mockUser = generateMockUser({ isBlocked: false })
			const blockedUser = generateMockUser({ isBlocked: true })

			prismaMock.user.findUnique.mockResolvedValue(mockUser as any)
			prismaMock.user.update.mockResolvedValue(blockedUser as any)

			await updateUserStatus(req as Request, res as Response)

			expect(res.status).toHaveBeenCalledWith(200)
		})

		it('should unblock user', async () => {
			const req = mockRequest({
				params: { id: 'user-123' },
				body: { isBlocked: false },
			})
			const res = mockResponse()

			const mockUser = generateMockUser({ isBlocked: true })
			const unblockedUser = generateMockUser({ isBlocked: false })

			prismaMock.user.findUnique.mockResolvedValue(mockUser as any)
			prismaMock.user.update.mockResolvedValue(unblockedUser as any)

			await updateUserStatus(req as Request, res as Response)

			expect(res.status).toHaveBeenCalledWith(200)
		})
	})

	// ========================================================================
	// updateUserRole - Role Management
	// ========================================================================
	describe('updateUserRole - Role Changes', () => {
		it('should update user role to ADMIN', async () => {
			const req = mockRequest({
				params: { id: 'user-123' },
				body: { role: 'ADMIN' },
			})
			const res = mockResponse()

			const mockUser = generateMockUser({ role: 'CUSTOMER' })
			const updatedUser = generateMockUser({ role: 'ADMIN' })

			prismaMock.user.findUnique.mockResolvedValue(mockUser as any)
			prismaMock.user.update.mockResolvedValue(updatedUser as any)

			await updateUserRole(req as Request, res as Response)

			expect(res.status).toHaveBeenCalledWith(200)
		})

		it('should validate role value', async () => {
			const req = mockRequest({
				params: { id: 'user-123' },
				body: { role: 'INVALID_ROLE' },
			})
			const res = mockResponse()

			await updateUserRole(req as Request, res as Response)

			expect(res.status).toHaveBeenCalledWith(400)
		})
	})
})
