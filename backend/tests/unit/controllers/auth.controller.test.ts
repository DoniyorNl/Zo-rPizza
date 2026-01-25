// backend/tests/unit/controllers/auth.controller.test.ts
// 🔐 AUTH CONTROLLER TESTS - Security Critical

import { Response } from 'express'
import { AuthRequest } from '../../../src/middleware/auth.middleware'
import { authController } from '../../../src/controllers/auth.controller'
import { auth } from '../../../src/config/firebase'

// Mock Firebase
jest.mock('../../../src/config/firebase', () => ({
	auth: {
		getUser: jest.fn(),
		setCustomUserClaims: jest.fn(),
	},
}))

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const mockRequest = (overrides: any = {}): Partial<AuthRequest> => ({
	userId: undefined,
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
	emailVerified: true,
	metadata: {
		creationTime: '2026-01-01T00:00:00Z',
		lastSignInTime: '2026-01-26T00:00:00Z',
	},
	...overrides,
})

// ============================================================================
// TESTS
// ============================================================================

describe('Auth Controller', () => {
	beforeEach(() => {
		jest.clearAllMocks()
		jest.spyOn(console, 'error').mockImplementation()
	})

	afterEach(() => {
		jest.restoreAllMocks()
	})

	// ========================================================================
	// getCurrentUser Tests
	// ========================================================================
	describe('getCurrentUser', () => {
		it('should return current user data', async () => {
			const req = mockRequest({
				userId: 'firebase-123',
			}) as AuthRequest
			const res = mockResponse() as Response

			const mockUser = generateMockFirebaseUser()
			;(auth.getUser as jest.Mock).mockResolvedValue(mockUser)

			await authController.getCurrentUser(req, res)

			expect(res.status).toHaveBeenCalledWith(200)
			expect(res.json).toHaveBeenCalledWith({
				success: true,
				data: expect.objectContaining({
					uid: 'firebase-123',
					email: 'test@example.com',
					displayName: 'Test User',
				}),
			})
		})

		it('should return 401 if no userId', async () => {
			const req = mockRequest() as AuthRequest
			const res = mockResponse() as Response

			await authController.getCurrentUser(req, res)

			expect(res.status).toHaveBeenCalledWith(401)
			expect(res.json).toHaveBeenCalledWith({
				success: false,
				message: expect.stringContaining('User ID'),
			})
		})

		it('should include user metadata', async () => {
			const req = mockRequest({
				userId: 'firebase-123',
			}) as AuthRequest
			const res = mockResponse() as Response

			const mockUser = generateMockFirebaseUser()
			;(auth.getUser as jest.Mock).mockResolvedValue(mockUser)

			await authController.getCurrentUser(req, res)

			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					data: expect.objectContaining({
						metadata: expect.objectContaining({
							creationTime: expect.any(String),
							lastSignInTime: expect.any(String),
						}),
					}),
				}),
			)
		})

		it('should include emailVerified status', async () => {
			const req = mockRequest({
				userId: 'firebase-123',
			}) as AuthRequest
			const res = mockResponse() as Response

			const mockUser = generateMockFirebaseUser({ emailVerified: false })
			;(auth.getUser as jest.Mock).mockResolvedValue(mockUser)

			await authController.getCurrentUser(req, res)

			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					data: expect.objectContaining({
						emailVerified: false,
					}),
				}),
			)
		})

		it('should handle Firebase errors', async () => {
			const req = mockRequest({
				userId: 'firebase-123',
			}) as AuthRequest
			const res = mockResponse() as Response

			;(auth.getUser as jest.Mock).mockRejectedValue(new Error('Firebase error'))

			await authController.getCurrentUser(req, res)

			expect(res.status).toHaveBeenCalledWith(500)
		})

		it('should handle user not found', async () => {
			const req = mockRequest({
				userId: 'nonexistent',
			}) as AuthRequest
			const res = mockResponse() as Response

			;(auth.getUser as jest.Mock).mockRejectedValue(new Error('User not found'))

			await authController.getCurrentUser(req, res)

			expect(res.status).toHaveBeenCalledWith(500)
			expect(console.error).toHaveBeenCalled()
		})
	})

	// ========================================================================
	// setAdminRole Tests
	// ========================================================================
	describe('setAdminRole', () => {
		it('should set admin role successfully', async () => {
			const req = mockRequest({
				body: { uid: 'user-123' },
			}) as AuthRequest
			const res = mockResponse() as Response

			;(auth.setCustomUserClaims as jest.Mock).mockResolvedValue(undefined)

			await authController.setAdminRole(req, res)

			expect(auth.setCustomUserClaims).toHaveBeenCalledWith('user-123', { admin: true })
			expect(res.status).toHaveBeenCalledWith(200)
			expect(res.json).toHaveBeenCalledWith({
				success: true,
				message: expect.stringContaining('admin'),
			})
		})

		it('should return 400 if uid not provided', async () => {
			const req = mockRequest({
				body: {},
			}) as AuthRequest
			const res = mockResponse() as Response

			await authController.setAdminRole(req, res)

			expect(res.status).toHaveBeenCalledWith(400)
			expect(res.json).toHaveBeenCalledWith({
				success: false,
				message: expect.stringContaining('UID'),
			})
		})

		it('should handle Firebase errors', async () => {
			const req = mockRequest({
				body: { uid: 'user-123' },
			}) as AuthRequest
			const res = mockResponse() as Response

			;(auth.setCustomUserClaims as jest.Mock).mockRejectedValue(
				new Error('Firebase error'),
			)

			await authController.setAdminRole(req, res)

			expect(res.status).toHaveBeenCalledWith(500)
		})

		it('should log errors', async () => {
			const req = mockRequest({
				body: { uid: 'user-123' },
			}) as AuthRequest
			const res = mockResponse() as Response

			;(auth.setCustomUserClaims as jest.Mock).mockRejectedValue(
				new Error('Test error'),
			)

			await authController.setAdminRole(req, res)

			expect(console.error).toHaveBeenCalled()
		})

		it('should set custom claims with admin true', async () => {
			const req = mockRequest({
				body: { uid: 'user-123' },
			}) as AuthRequest
			const res = mockResponse() as Response

			;(auth.setCustomUserClaims as jest.Mock).mockResolvedValue(undefined)

			await authController.setAdminRole(req, res)

			expect(auth.setCustomUserClaims).toHaveBeenCalledWith('user-123', {
				admin: true,
			})
		})

		it('should return success message with uid', async () => {
			const req = mockRequest({
				body: { uid: 'user-456' },
			}) as AuthRequest
			const res = mockResponse() as Response

			;(auth.setCustomUserClaims as jest.Mock).mockResolvedValue(undefined)

			await authController.setAdminRole(req, res)

			expect(res.json).toHaveBeenCalledWith({
				success: true,
				message: expect.stringContaining('user-456'),
			})
		})
	})
})
