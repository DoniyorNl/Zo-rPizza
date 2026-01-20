// =====================================
// 📁 FILE PATH: backend/tests/unit/middleware/auth.middleware.test.ts
// 🧪 AUTH MIDDLEWARE UNIT TESTS
// =====================================

import { Request, Response, NextFunction } from 'express'
import { authenticateToken, AuthRequest } from '../../../src/middleware/auth.middleware'
import { auth } from '../../../src/config/firebase'

describe('Auth Middleware', () => {
	let mockReq: Partial<AuthRequest>
	let mockRes: Partial<Response>
	let mockNext: NextFunction
	let mockJson: jest.Mock
	let mockStatus: jest.Mock

	beforeEach(() => {
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
	})

	describe('authenticateToken', () => {
		it('should return 401 if no token provided', async () => {
			await authenticateToken(mockReq as AuthRequest, mockRes as Response, mockNext)

			expect(mockStatus).toHaveBeenCalledWith(401)
			expect(mockJson).toHaveBeenCalledWith(
				expect.objectContaining({
					success: false,
					message: expect.stringContaining('Token'),
				}),
			)
			expect(mockNext).not.toHaveBeenCalled()
		})

		it('should verify valid token and call next()', async () => {
			const mockToken = 'valid-firebase-token'
			const mockDecodedToken = {
				uid: 'user-123',
				email: 'test@example.com',
			}

			mockReq.headers = {
				authorization: `Bearer ${mockToken}`,
			}

			;(auth.verifyIdToken as jest.Mock).mockResolvedValue(mockDecodedToken)

			await authenticateToken(mockReq as AuthRequest, mockRes as Response, mockNext)

			expect(auth.verifyIdToken).toHaveBeenCalledWith(mockToken)
			expect(mockReq.userId).toBe('user-123')
			expect(mockReq.userEmail).toBe('test@example.com')
			expect(mockNext).toHaveBeenCalled()
			expect(mockStatus).not.toHaveBeenCalled()
		})

		it('should return 403 for invalid token', async () => {
			mockReq.headers = {
				authorization: 'Bearer invalid-token',
			}

			;(auth.verifyIdToken as jest.Mock).mockRejectedValue(new Error('Invalid token'))

			await authenticateToken(mockReq as AuthRequest, mockRes as Response, mockNext)

			expect(mockStatus).toHaveBeenCalledWith(403)
			expect(mockJson).toHaveBeenCalledWith(
				expect.objectContaining({
					success: false,
					message: expect.stringContaining('yaroqsiz'),
				}),
			)
			expect(mockNext).not.toHaveBeenCalled()
		})

		it('should handle authorization header without Bearer prefix', async () => {
			mockReq.headers = {
				authorization: 'invalid-format',
			}

			await authenticateToken(mockReq as AuthRequest, mockRes as Response, mockNext)

			expect(mockStatus).toHaveBeenCalledWith(401)
		})
	})
})
