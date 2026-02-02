// backend/tests/unit/middleware/firebase-auth.middleware.test.ts
// 🔒 FIREBASE AUTH MIDDLEWARE UNIT TESTS

import { NextFunction, Response } from 'express'
import { auth } from '../../../src/config/firebase'
import {
	authenticateFirebaseToken,
	AuthRequest,
	optionalAuth,
	requireAdmin,
} from '../../../src/middleware/firebase-auth.middleware'

describe('Firebase Auth Middleware', () => {
	let mockReq: Partial<AuthRequest>
	let mockRes: Partial<Response>
	let mockNext: NextFunction
	let mockJson: jest.Mock
	let mockStatus: jest.Mock

	beforeEach(() => {
		jest.clearAllMocks()
		mockJson = jest.fn()
		mockStatus = jest.fn().mockReturnValue({ json: mockJson })
		mockNext = jest.fn()
		mockReq = {
			headers: {},
		}
		mockRes = {
			status: mockStatus,
			json: mockJson,
		}
		jest.spyOn(console, 'error').mockImplementation()
	})

	afterEach(() => {
		jest.restoreAllMocks()
	})

	// ========================================================================
	// authenticateFirebaseToken
	// ========================================================================
	describe('authenticateFirebaseToken', () => {
		it('should return 401 if no token provided', async () => {
			await authenticateFirebaseToken(
				mockReq as AuthRequest,
				mockRes as Response,
				mockNext
			)

			expect(mockStatus).toHaveBeenCalledWith(401)
			expect(mockJson).toHaveBeenCalledWith({
				success: false,
				message: 'Token topilmadi. Iltimos, tizimga kiring.',
			})
			expect(mockNext).not.toHaveBeenCalled()
			expect(auth.verifyIdToken).not.toHaveBeenCalled()
		})

		it('should return 401 if Authorization header does not start with Bearer', async () => {
			mockReq.headers = { authorization: 'Invalid token' }

			await authenticateFirebaseToken(
				mockReq as AuthRequest,
				mockRes as Response,
				mockNext
			)

			expect(mockStatus).toHaveBeenCalledWith(401)
			expect(mockJson).toHaveBeenCalledWith({
				success: false,
				message: 'Token topilmadi. Iltimos, tizimga kiring.',
			})
			expect(mockNext).not.toHaveBeenCalled()
		})

		it('should verify valid token and call next() with user data', async () => {
			const token = 'valid-firebase-token'
			const decoded = {
				uid: 'user-uid-123',
				email: 'user@example.com',
				role: 'CUSTOMER',
			}
			mockReq.headers = { authorization: `Bearer ${token}` }
				; (auth.verifyIdToken as jest.Mock).mockResolvedValue(decoded)

			await authenticateFirebaseToken(
				mockReq as AuthRequest,
				mockRes as Response,
				mockNext
			)

			expect(auth.verifyIdToken).toHaveBeenCalledWith(token)
			expect(mockReq.userId).toBe('user-uid-123')
			expect(mockReq.userEmail).toBe('user@example.com')
			expect(mockReq.userRole).toBe('CUSTOMER')
			expect(mockNext).toHaveBeenCalled()
			expect(mockStatus).not.toHaveBeenCalled()
		})

		it('should use "customer" as default role when role not in token', async () => {
			const token = 'valid-token'
			const decoded = { uid: 'uid-1', email: 'a@b.com' }
			mockReq.headers = { authorization: `Bearer ${token}` }
				; (auth.verifyIdToken as jest.Mock).mockResolvedValue(decoded)

			await authenticateFirebaseToken(
				mockReq as AuthRequest,
				mockRes as Response,
				mockNext
			)

			expect(mockReq.userRole).toBe('customer')
			expect(mockNext).toHaveBeenCalled()
		})

		it('should return 401 with TOKEN_EXPIRED when token expired', async () => {
			mockReq.headers = { authorization: 'Bearer expired-token' }
				; (auth.verifyIdToken as jest.Mock).mockRejectedValue({
					code: 'auth/id-token-expired',
					message: 'Token expired',
				})

			await authenticateFirebaseToken(
				mockReq as AuthRequest,
				mockRes as Response,
				mockNext
			)

			expect(mockStatus).toHaveBeenCalledWith(401)
			expect(mockJson).toHaveBeenCalledWith({
				success: false,
				message: 'Token muddati tugagan. Qaytadan kiring.',
				code: 'TOKEN_EXPIRED',
			})
			expect(mockNext).not.toHaveBeenCalled()
		})

		it('should return 401 with INVALID_TOKEN for invalid credential', async () => {
			mockReq.headers = { authorization: 'Bearer bad-token' }
				; (auth.verifyIdToken as jest.Mock).mockRejectedValue({
					code: 'auth/invalid-credential',
					message: 'Invalid',
				})

			await authenticateFirebaseToken(
				mockReq as AuthRequest,
				mockRes as Response,
				mockNext
			)

			expect(mockStatus).toHaveBeenCalledWith(401)
			expect(mockJson).toHaveBeenCalledWith({
				success: false,
				message: "Noto'g'ri token. Qaytadan kiring.",
				code: 'INVALID_TOKEN',
			})
			expect(mockNext).not.toHaveBeenCalled()
		})

		it('should return 401 with INVALID_TOKEN for argument-error', async () => {
			mockReq.headers = { authorization: 'Bearer bad' }
				; (auth.verifyIdToken as jest.Mock).mockRejectedValue({
					code: 'auth/argument-error',
					message: 'Argument error',
				})

			await authenticateFirebaseToken(
				mockReq as AuthRequest,
				mockRes as Response,
				mockNext
			)

			expect(mockStatus).toHaveBeenCalledWith(401)
			expect(mockJson).toHaveBeenCalledWith(
				expect.objectContaining({ code: 'INVALID_TOKEN' })
			)
			expect(mockNext).not.toHaveBeenCalled()
		})

		it('should return 403 for other auth errors', async () => {
			mockReq.headers = { authorization: 'Bearer x' }
				; (auth.verifyIdToken as jest.Mock).mockRejectedValue({
					code: 'auth/other-error',
					message: 'Other error',
				})

			await authenticateFirebaseToken(
				mockReq as AuthRequest,
				mockRes as Response,
				mockNext
			)

			expect(mockStatus).toHaveBeenCalledWith(403)
			expect(mockJson).toHaveBeenCalledWith({
				success: false,
				message: 'Autentifikatsiya xatosi.',
				code: 'auth/other-error',
			})
			expect(mockNext).not.toHaveBeenCalled()
		})
	})

	// ========================================================================
	// requireAdmin
	// ========================================================================
	describe('requireAdmin', () => {
		it('should return 401 if userId is missing', async () => {
			await requireAdmin(mockReq as AuthRequest, mockRes as Response, mockNext)

			expect(mockStatus).toHaveBeenCalledWith(401)
			expect(mockJson).toHaveBeenCalledWith({
				success: false,
				message: 'Autentifikatsiya talab qilinadi.',
			})
			expect(mockNext).not.toHaveBeenCalled()
			expect(auth.getUser).not.toHaveBeenCalled()
		})

		it('should return 403 if user is not admin', async () => {
			mockReq.userId = 'user-123'
				; (auth.getUser as jest.Mock).mockResolvedValue({
					uid: 'user-123',
					customClaims: {},
				})

			await requireAdmin(mockReq as AuthRequest, mockRes as Response, mockNext)

			expect(auth.getUser).toHaveBeenCalledWith('user-123')
			expect(mockStatus).toHaveBeenCalledWith(403)
			expect(mockJson).toHaveBeenCalledWith({
				success: false,
				message: "Sizda admin huquqlari yo'q. Faqat adminlar kirishi mumkin.",
			})
			expect(mockNext).not.toHaveBeenCalled()
		})

		it('should call next() and set userRole when user has admin in customClaims', async () => {
			mockReq.userId = 'admin-uid'
				; (auth.getUser as jest.Mock).mockResolvedValue({
					uid: 'admin-uid',
					customClaims: { admin: true },
				})

			await requireAdmin(mockReq as AuthRequest, mockRes as Response, mockNext)

			expect(auth.getUser).toHaveBeenCalledWith('admin-uid')
			expect(mockReq.userRole).toBe('admin')
			expect(mockNext).toHaveBeenCalled()
			expect(mockStatus).not.toHaveBeenCalled()
		})

		it('should allow when customClaims.role === "admin"', async () => {
			mockReq.userId = 'admin-uid'
				; (auth.getUser as jest.Mock).mockResolvedValue({
					uid: 'admin-uid',
					customClaims: { role: 'admin' },
				})

			await requireAdmin(mockReq as AuthRequest, mockRes as Response, mockNext)

			expect(mockReq.userRole).toBe('admin')
			expect(mockNext).toHaveBeenCalled()
		})

		it('should return 500 when getUser throws', async () => {
			mockReq.userId = 'user-123'
				; (auth.getUser as jest.Mock).mockRejectedValue(new Error('Firebase error'))

			await requireAdmin(mockReq as AuthRequest, mockRes as Response, mockNext)

			expect(mockStatus).toHaveBeenCalledWith(500)
			expect(mockJson).toHaveBeenCalledWith({
				success: false,
				message: 'Admin huquqlarini tekshirishda xatolik.',
			})
			expect(mockNext).not.toHaveBeenCalled()
		})
	})

	// ========================================================================
	// optionalAuth
	// ========================================================================
	describe('optionalAuth', () => {
		it('should call next() without setting userId when no token', async () => {
			await optionalAuth(mockReq as AuthRequest, mockRes as Response, mockNext)

			expect(mockNext).toHaveBeenCalled()
			expect(mockReq.userId).toBeUndefined()
			expect(auth.verifyIdToken).not.toHaveBeenCalled()
		})

		it('should verify token and set user data when token provided', async () => {
			const token = 'optional-token'
			const decoded = {
				uid: 'opt-uid',
				email: 'opt@example.com',
				role: 'ADMIN',
			}
			mockReq.headers = { authorization: `Bearer ${token}` }
				; (auth.verifyIdToken as jest.Mock).mockResolvedValue(decoded)

			await optionalAuth(mockReq as AuthRequest, mockRes as Response, mockNext)

			expect(auth.verifyIdToken).toHaveBeenCalledWith(token)
			expect(mockReq.userId).toBe('opt-uid')
			expect(mockReq.userEmail).toBe('opt@example.com')
			expect(mockReq.userRole).toBe('ADMIN')
			expect(mockNext).toHaveBeenCalled()
		})

		it('should use "customer" as default role when role not in token', async () => {
			mockReq.headers = { authorization: 'Bearer t' }
				; (auth.verifyIdToken as jest.Mock).mockResolvedValue({
					uid: 'u',
					email: 'e@e.com',
				})

			await optionalAuth(mockReq as AuthRequest, mockRes as Response, mockNext)

			expect(mockReq.userRole).toBe('customer')
			expect(mockNext).toHaveBeenCalled()
		})

		it('should call next() even when token verification fails (optional auth)', async () => {
			mockReq.headers = { authorization: 'Bearer bad' }
				; (auth.verifyIdToken as jest.Mock).mockRejectedValue(new Error('Invalid'))

			await optionalAuth(mockReq as AuthRequest, mockRes as Response, mockNext)

			expect(mockNext).toHaveBeenCalled()
			expect(mockStatus).not.toHaveBeenCalled()
		})
	})
})
