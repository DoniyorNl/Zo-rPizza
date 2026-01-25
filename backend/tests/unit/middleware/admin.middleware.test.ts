// backend/tests/unit/middleware/admin.middleware.test.ts
// 🛡️ ADMIN MIDDLEWARE TESTS - Senior Level Security Testing

import { Request, Response, NextFunction } from 'express'
import { DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended'
import prisma from '../../../src/lib/prisma'
import { adminOnly, roleOnly, authRequired } from '../../../src/middleware/admin.middleware'

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
	headers: {},
	ip: '127.0.0.1',
	socket: { remoteAddress: '127.0.0.1' } as any,
	method: 'GET',
	originalUrl: '/api/admin/test',
	...overrides,
})

const mockResponse = (): Partial<Response> => {
	const res: Partial<Response> = {
		status: jest.fn().mockReturnThis(),
		json: jest.fn().mockReturnThis(),
	}
	return res
}

const mockNext = (): NextFunction => jest.fn()

// Mock data generators
const generateMockUser = (overrides: any = {}) => ({
	id: 'user-123',
	email: 'admin@example.com',
	name: 'Admin User',
	role: 'ADMIN' as const,
	isBlocked: false,
	...overrides,
})

// ============================================================================
// TESTS
// ============================================================================

describe('Admin Middleware', () => {
	beforeEach(() => {
		mockReset(prismaMock)
		jest.clearAllMocks()
		jest.spyOn(console, 'log').mockImplementation()
		jest.spyOn(console, 'warn').mockImplementation()
		jest.spyOn(console, 'error').mockImplementation()
	})

	afterEach(() => {
		jest.restoreAllMocks()
	})

	// ========================================================================
	// adminOnly Tests
	// ========================================================================
	describe('adminOnly', () => {
		it('should allow admin user to pass', async () => {
			const req = mockRequest({
				userId: 'admin-123',
			}) as Request
			const res = mockResponse() as Response
			const next = mockNext()

			const mockUser = generateMockUser({ id: 'admin-123', role: 'ADMIN' })
			prismaMock.user.findUnique.mockResolvedValue(mockUser as any)

			await adminOnly(req, res, next)

			expect(next).toHaveBeenCalled()
			expect(req.user).toEqual({
				id: 'admin-123',
				email: 'admin@example.com',
				role: 'ADMIN',
				name: 'Admin User',
			})
		})

		it('should return 401 if no userId provided', async () => {
			const req = mockRequest() as Request
			const res = mockResponse() as Response
			const next = mockNext()

			await adminOnly(req, res, next)

			expect(res.status).toHaveBeenCalledWith(401)
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: false,
					message: expect.stringContaining('Kirish uchun'),
					code: 'AUTH_REQUIRED',
				}),
			)
			expect(next).not.toHaveBeenCalled()
		})

		it('should return 401 if user not found in database', async () => {
			const req = mockRequest({
				userId: 'nonexistent',
			}) as Request
			const res = mockResponse() as Response
			const next = mockNext()

			prismaMock.user.findUnique.mockResolvedValue(null)

			await adminOnly(req, res, next)

			expect(res.status).toHaveBeenCalledWith(401)
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: false,
					code: 'USER_NOT_FOUND',
				}),
			)
		})

		it('should return 403 if user is blocked', async () => {
			const req = mockRequest({
				userId: 'blocked-user',
			}) as Request
			const res = mockResponse() as Response
			const next = mockNext()

			const blockedUser = generateMockUser({
				id: 'blocked-user',
				isBlocked: true,
			})
			prismaMock.user.findUnique.mockResolvedValue(blockedUser as any)

			await adminOnly(req, res, next)

			expect(res.status).toHaveBeenCalledWith(403)
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: false,
					message: expect.stringContaining('blocked'),
				}),
			)
		})

		it('should return 403 if user is not admin', async () => {
			const req = mockRequest({
				userId: 'customer-123',
			}) as Request
			const res = mockResponse() as Response
			const next = mockNext()

			const customerUser = generateMockUser({
				id: 'customer-123',
				role: 'CUSTOMER',
			})
			prismaMock.user.findUnique.mockResolvedValue(customerUser as any)

			await adminOnly(req, res, next)

			expect(res.status).toHaveBeenCalledWith(403)
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: false,
					message: expect.stringContaining('Admin privileges required'),
				}),
			)
		})

		it('should support userId from header (x-user-id)', async () => {
			const req = mockRequest({
				headers: { 'x-user-id': 'admin-456' },
			}) as Request
			const res = mockResponse() as Response
			const next = mockNext()

			const mockUser = generateMockUser({ id: 'admin-456' })
			prismaMock.user.findUnique.mockResolvedValue(mockUser as any)

			await adminOnly(req, res, next)

			expect(next).toHaveBeenCalled()
		})

		it('should return 429 for rate limit exceeded', async () => {
			const req = mockRequest({
				userId: 'admin-123',
				ip: '192.168.1.100',
			}) as Request
			const res = mockResponse() as Response
			const next = mockNext()

			// Simulate 61 requests to exceed limit
			for (let i = 0; i < 61; i++) {
				await adminOnly(req, res, next)
			}

			expect(res.status).toHaveBeenCalledWith(429)
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: false,
					message: expect.stringContaining('Too many requests'),
					retryAfter: 60,
				}),
			)
		})

		it('should handle database errors', async () => {
			const req = mockRequest({
				userId: 'admin-123',
			}) as Request
			const res = mockResponse() as Response
			const next = mockNext()

			prismaMock.user.findUnique.mockRejectedValue(new Error('Database error'))

			await adminOnly(req, res, next)

			expect(res.status).toHaveBeenCalledWith(500)
		})
	})

	// ========================================================================
	// roleOnly Tests
	// ========================================================================
	describe('roleOnly', () => {
		it('should allow user with correct role', async () => {
			const middleware = roleOnly(['ADMIN', 'DELIVERY'])
			const req = mockRequest({
				headers: { 'x-user-id': 'user-123' },
			}) as Request
			const res = mockResponse() as Response
			const next = mockNext()

			const mockUser = generateMockUser({ role: 'ADMIN' })
			prismaMock.user.findUnique.mockResolvedValue(mockUser as any)

			await middleware(req, res, next)

			expect(next).toHaveBeenCalled()
		})

		it('should reject user without allowed role', async () => {
			const middleware = roleOnly(['ADMIN'])
			const req = mockRequest({
				headers: { 'x-user-id': 'user-123' },
			}) as Request
			const res = mockResponse() as Response
			const next = mockNext()

			const mockUser = generateMockUser({ role: 'CUSTOMER' })
			prismaMock.user.findUnique.mockResolvedValue(mockUser as any)

			await middleware(req, res, next)

			expect(res.status).toHaveBeenCalledWith(403)
			expect(next).not.toHaveBeenCalled()
		})

		it('should block users even with correct role', async () => {
			const middleware = roleOnly(['ADMIN'])
			const req = mockRequest({
				headers: { 'x-user-id': 'user-123' },
			}) as Request
			const res = mockResponse() as Response
			const next = mockNext()

			const mockUser = generateMockUser({ role: 'ADMIN', isBlocked: true })
			prismaMock.user.findUnique.mockResolvedValue(mockUser as any)

			await middleware(req, res, next)

			expect(res.status).toHaveBeenCalledWith(403)
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					message: 'Account blocked',
				}),
			)
		})
	})

	// ========================================================================
	// authRequired Tests
	// ========================================================================
	describe('authRequired', () => {
		it('should allow any authenticated user', async () => {
			const req = mockRequest({
				headers: { 'x-user-id': 'user-123' },
			}) as Request
			const res = mockResponse() as Response
			const next = mockNext()

			const mockUser = generateMockUser({ role: 'CUSTOMER' })
			prismaMock.user.findUnique.mockResolvedValue(mockUser as any)

			await authRequired(req, res, next)

			expect(next).toHaveBeenCalled()
		})

		it('should return 401 if not authenticated', async () => {
			const req = mockRequest() as Request
			const res = mockResponse() as Response
			const next = mockNext()

			await authRequired(req, res, next)

			expect(res.status).toHaveBeenCalledWith(401)
		})

		it('should reject blocked users', async () => {
			const req = mockRequest({
				headers: { 'x-user-id': 'user-123' },
			}) as Request
			const res = mockResponse() as Response
			const next = mockNext()

			const mockUser = generateMockUser({ isBlocked: true })
			prismaMock.user.findUnique.mockResolvedValue(mockUser as any)

			await authRequired(req, res, next)

			expect(res.status).toHaveBeenCalledWith(403)
		})
	})
})
