// backend/tests/unit/controllers/firebase-auth.controller.test.ts
// 🔥 FIREBASE AUTH CONTROLLER TESTS - Critical Security

import { Response } from 'express'
import { DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended'
import { auth } from '../../../src/config/firebase'
import { firebaseAuthController } from '../../../src/controllers/firebase-auth.controller'
import prisma from '../../../src/lib/prisma'
import { AuthRequest } from '../../../src/middleware/auth.middleware'

// Mock Firebase and Prisma
jest.mock('../../../src/config/firebase', () => ({
	auth: {
		getUser: jest.fn(),
		setCustomUserClaims: jest.fn(),
		listUsers: jest.fn(),
	},
}))

jest.mock('../../../src/lib/prisma', () => ({
	__esModule: true,
	default: mockDeep<typeof prisma>(),
}))

const prismaMock = prisma as unknown as DeepMockProxy<typeof prisma>

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const mockRequest = (overrides: any = {}): Partial<AuthRequest> => ({
	userId: undefined,
	userEmail: undefined,
	body: {},
	...overrides,
})

const mockResponse = (): Partial<Response> => {
	const res: Partial<Response> = {
		status: jest.fn().mockReturnThis(),
		json: jest.fn().mockReturnThis(),
	}
	return res
}

const generateMockFirebaseUser = (overrides: any = {}) => ({
	uid: 'firebase-123',
	email: 'test@example.com',
	displayName: 'Test User',
	photoURL: 'https://example.com/photo.jpg',
	phoneNumber: '+998901234567',
	emailVerified: true,
	disabled: false,
	customClaims: {},
	metadata: {
		creationTime: '2026-01-01T00:00:00Z',
		lastSignInTime: '2026-01-26T00:00:00Z',
		lastRefreshTime: '2026-01-26T00:00:00Z',
	},
	...overrides,
})

const generateMockDbUser = (overrides: any = {}) => ({
	id: 'db-uuid-123',
	firebaseUid: 'firebase-123',
	email: 'test@example.com',
	name: 'Test User',
	phone: '+998901234567',
	role: 'CUSTOMER' as const,
	isBlocked: false,
	createdAt: new Date(),
	updatedAt: new Date(),
	...overrides,
})

// ============================================================================
// TESTS
// ============================================================================

describe('Firebase Auth Controller', () => {
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
	// verifyToken Tests
	// ========================================================================
	describe('verifyToken', () => {
		it('should verify token and return user info', async () => {
			const req = mockRequest({
				userId: 'firebase-123',
				userEmail: 'test@example.com',
			}) as AuthRequest
			const res = mockResponse() as Response

			await firebaseAuthController.verifyToken(req, res)

			expect(res.status).toHaveBeenCalledWith(200)
			expect(res.json).toHaveBeenCalledWith({
				success: true,
				message: expect.stringContaining('Token'),
				data: expect.objectContaining({
					userId: 'firebase-123',
					email: 'test@example.com',
				}),
			})
		})

		it('should include timestamp', async () => {
			const req = mockRequest({
				userId: 'firebase-123',
			}) as AuthRequest
			const res = mockResponse() as Response

			await firebaseAuthController.verifyToken(req, res)

			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					data: expect.objectContaining({
						timestamp: expect.any(String),
					}),
				}),
			)
		})
	})

	// ========================================================================
	// getCurrentUser Tests
	// ========================================================================
	describe('getCurrentUser', () => {
		it('should return user from both Firebase and DB', async () => {
			const req = mockRequest({
				userId: 'firebase-123',
			}) as AuthRequest
			const res = mockResponse() as Response

			const mockFirebaseUser = generateMockFirebaseUser()
			const mockDbUser = generateMockDbUser()

			;(auth.getUser as jest.Mock).mockResolvedValue(mockFirebaseUser)
			prismaMock.user.findUnique.mockResolvedValue(mockDbUser as any)

			await firebaseAuthController.getCurrentUser(req, res)

			expect(res.status).toHaveBeenCalledWith(200)
			expect(res.json).toHaveBeenCalledWith({
				success: true,
				data: {
					firebase: expect.objectContaining({
						uid: 'firebase-123',
						email: 'test@example.com',
					}),
					database: expect.objectContaining({
						id: 'db-uuid-123',
						firebaseUid: 'firebase-123',
						role: 'CUSTOMER',
					}),
				},
			})
		})

		it('should create user in DB if not exists', async () => {
			const req = mockRequest({
				userId: 'firebase-new',
			}) as AuthRequest
			const res = mockResponse() as Response

			const mockFirebaseUser = generateMockFirebaseUser({ uid: 'firebase-new' })
			const newDbUser = generateMockDbUser({ firebaseUid: 'firebase-new' })

			;(auth.getUser as jest.Mock).mockResolvedValue(mockFirebaseUser)
			prismaMock.user.findUnique.mockResolvedValue(null)
			prismaMock.user.create.mockResolvedValue(newDbUser as any)

			await firebaseAuthController.getCurrentUser(req, res)

			expect(prismaMock.user.create).toHaveBeenCalledWith(
				expect.objectContaining({
					data: expect.objectContaining({
						firebaseUid: 'firebase-new',
						email: mockFirebaseUser.email,
						role: 'CUSTOMER',
					}),
				}),
			)
			expect(res.status).toHaveBeenCalledWith(200)
		})

		it('should return 401 if no userId', async () => {
			const req = mockRequest() as AuthRequest
			const res = mockResponse() as Response

			await firebaseAuthController.getCurrentUser(req, res)

			expect(res.status).toHaveBeenCalledWith(401)
		})

		it('should handle Firebase errors', async () => {
			const req = mockRequest({
				userId: 'firebase-123',
			}) as AuthRequest
			const res = mockResponse() as Response

			;(auth.getUser as jest.Mock).mockRejectedValue(new Error('Firebase error'))

			await firebaseAuthController.getCurrentUser(req, res)

			expect(res.status).toHaveBeenCalledWith(500)
		})
	})

	// ========================================================================
	// syncUser Tests
	// ========================================================================
	describe('syncUser', () => {
		it('should create new user if not exists', async () => {
			const req = mockRequest({
				userId: 'firebase-new',
			}) as AuthRequest
			const res = mockResponse() as Response

			const mockFirebaseUser = generateMockFirebaseUser()
			const newDbUser = generateMockDbUser()

			;(auth.getUser as jest.Mock).mockResolvedValue(mockFirebaseUser)
			prismaMock.user.findUnique.mockResolvedValue(null)
			prismaMock.user.create.mockResolvedValue(newDbUser as any)

			await firebaseAuthController.syncUser(req, res)

			expect(res.status).toHaveBeenCalledWith(201)
			expect(res.json).toHaveBeenCalledWith({
				success: true,
				message: expect.stringContaining('yaratildi'),
				data: expect.any(Object),
			})
		})

		it('should update existing user', async () => {
			const req = mockRequest({
				userId: 'firebase-123',
			}) as AuthRequest
			const res = mockResponse() as Response

			const mockFirebaseUser = generateMockFirebaseUser()
			const existingUser = generateMockDbUser()
			const updatedUser = generateMockDbUser({ name: 'Updated Name' })

			;(auth.getUser as jest.Mock).mockResolvedValue(mockFirebaseUser)
			prismaMock.user.findUnique.mockResolvedValue(existingUser as any)
			prismaMock.user.update.mockResolvedValue(updatedUser as any)

			await firebaseAuthController.syncUser(req, res)

			expect(res.status).toHaveBeenCalledWith(200)
			expect(res.json).toHaveBeenCalledWith({
				success: true,
				message: expect.stringContaining('yangilandi'),
				data: expect.any(Object),
			})
		})

		it('should return 401 if no userId', async () => {
			const req = mockRequest() as AuthRequest
			const res = mockResponse() as Response

			await firebaseAuthController.syncUser(req, res)

			expect(res.status).toHaveBeenCalledWith(401)
		})
	})

	// ========================================================================
	// setAdminRole Tests
	// ========================================================================
	describe('setAdminRole', () => {
		it('should set admin role in both Firebase and DB', async () => {
			const req = mockRequest({
				body: { uid: 'user-123' },
			}) as AuthRequest
			const res = mockResponse() as Response

			const updatedUser = generateMockDbUser({ firebaseUid: 'user-123', role: 'ADMIN' })

			;(auth.setCustomUserClaims as jest.Mock).mockResolvedValue(undefined)
			prismaMock.user.update.mockResolvedValue(updatedUser as any)

			await firebaseAuthController.setAdminRole(req, res)

			expect(auth.setCustomUserClaims).toHaveBeenCalledWith('user-123', {
				admin: true,
				role: 'admin',
			})
			expect(prismaMock.user.update).toHaveBeenCalledWith({
				where: { firebaseUid: 'user-123' },
				data: { role: 'ADMIN' },
			})
			expect(res.status).toHaveBeenCalledWith(200)
		})

		it('should return 400 if uid not provided', async () => {
			const req = mockRequest({
				body: {},
			}) as AuthRequest
			const res = mockResponse() as Response

			await firebaseAuthController.setAdminRole(req, res)

			expect(res.status).toHaveBeenCalledWith(400)
		})
	})

	// ========================================================================
	// removeAdminRole Tests
	// ========================================================================
	describe('removeAdminRole', () => {
		it('should remove admin role from both Firebase and DB', async () => {
			const req = mockRequest({
				body: { uid: 'user-123' },
			}) as AuthRequest
			const res = mockResponse() as Response

			const updatedUser = generateMockDbUser({ firebaseUid: 'user-123', role: 'CUSTOMER' })

			;(auth.setCustomUserClaims as jest.Mock).mockResolvedValue(undefined)
			prismaMock.user.update.mockResolvedValue(updatedUser as any)

			await firebaseAuthController.removeAdminRole(req, res)

			expect(auth.setCustomUserClaims).toHaveBeenCalledWith('user-123', {
				admin: false,
				role: 'customer',
			})
			expect(prismaMock.user.update).toHaveBeenCalledWith({
				where: { firebaseUid: 'user-123' },
				data: { role: 'CUSTOMER' },
			})
			expect(res.status).toHaveBeenCalledWith(200)
		})

		it('should return 400 if uid not provided', async () => {
			const req = mockRequest({
				body: {},
			}) as AuthRequest
			const res = mockResponse() as Response

			await firebaseAuthController.removeAdminRole(req, res)

			expect(res.status).toHaveBeenCalledWith(400)
		})
	})

	// ========================================================================
	// getAllFirebaseUsers Tests
	// ========================================================================
	describe('getAllFirebaseUsers', () => {
		it('should return all Firebase users', async () => {
			const req = mockRequest() as AuthRequest
			const res = mockResponse() as Response

			const mockUsers = [
				generateMockFirebaseUser(),
				generateMockFirebaseUser({ uid: 'firebase-456', email: 'test2@example.com' }),
			]

			;(auth.listUsers as jest.Mock).mockResolvedValue({ users: mockUsers })

			await firebaseAuthController.getAllFirebaseUsers(req, res)

			expect(res.status).toHaveBeenCalledWith(200)
			expect(res.json).toHaveBeenCalledWith({
				success: true,
				data: {
					users: expect.arrayContaining([
						expect.objectContaining({ uid: 'firebase-123' }),
						expect.objectContaining({ uid: 'firebase-456' }),
					]),
					count: 2,
				},
			})
		})

		it('should handle empty user list', async () => {
			const req = mockRequest() as AuthRequest
			const res = mockResponse() as Response

			;(auth.listUsers as jest.Mock).mockResolvedValue({ users: [] })

			await firebaseAuthController.getAllFirebaseUsers(req, res)

			expect(res.json).toHaveBeenCalledWith({
				success: true,
				data: {
					users: [],
					count: 0,
				},
			})
		})

		it('should handle Firebase errors', async () => {
			const req = mockRequest() as AuthRequest
			const res = mockResponse() as Response

			;(auth.listUsers as jest.Mock).mockRejectedValue(new Error('Firebase error'))

			await firebaseAuthController.getAllFirebaseUsers(req, res)

			expect(res.status).toHaveBeenCalledWith(500)
		})
	})
})
