// backend/tests/unit/middleware/errorHandler.test.ts
// ❌ ERROR HANDLER MIDDLEWARE TESTS - Senior Level

import { Request, Response, NextFunction } from 'express'
import { errorHandler, asyncHandler, notFoundHandler } from '../../../src/middleware/errorHandler'
import { AppError } from '../../../src/utils/errors'

// Mock logger
jest.mock('../../../src/utils/logger', () => ({
	logError: jest.fn(),
}))

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const mockRequest = (overrides: any = {}): Partial<Request> => ({
	method: 'GET',
	path: '/test',
	ip: '127.0.0.1',
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

// ============================================================================
// TESTS
// ============================================================================

describe('Error Handler Middleware', () => {
	beforeEach(() => {
		jest.clearAllMocks()
		jest.spyOn(console, 'error').mockImplementation()
	})

	afterEach(() => {
		jest.restoreAllMocks()
	})

	// ========================================================================
	// errorHandler Tests
	// ========================================================================
	describe('errorHandler', () => {
		it('should handle AppError correctly', () => {
			const req = mockRequest() as Request
			const res = mockResponse() as Response
			const next = mockNext()

			const error = new AppError(400, 'Test error', 'TEST_ERROR')

			errorHandler(error, req, res, next)

			expect(res.status).toHaveBeenCalledWith(400)
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: false,
					message: 'Test error',
					code: 'TEST_ERROR',
				}),
			)
		})

		it('should handle generic Error with 500', () => {
			const req = mockRequest() as Request
			const res = mockResponse() as Response
			const next = mockNext()

			const error = new Error('Generic error')

			errorHandler(error, req, res, next)

			expect(res.status).toHaveBeenCalledWith(500)
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: false,
					code: 'INTERNAL_ERROR',
				}),
			)
		})

		it('should include stack trace in development', () => {
			const originalEnv = process.env.NODE_ENV
			process.env.NODE_ENV = 'development'

			const req = mockRequest() as Request
			const res = mockResponse() as Response
			const next = mockNext()

			const error = new Error('Dev error')

			errorHandler(error, req, res, next)

			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					stack: expect.any(String),
				}),
			)

			process.env.NODE_ENV = originalEnv
		})

		it('should hide error details in production', () => {
			const originalEnv = process.env.NODE_ENV
			process.env.NODE_ENV = 'production'

			// Mock process.exit to prevent test crash
			const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never)

			const req = mockRequest() as Request
			const res = mockResponse() as Response
			const next = mockNext()

			const error = new Error('Sensitive error')

			errorHandler(error, req, res, next)

			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					message: 'Ichki server xatosi',
				}),
			)

			exitSpy.mockRestore()
			process.env.NODE_ENV = originalEnv
		})
	})

	// ========================================================================
	// asyncHandler Tests
	// ========================================================================
	describe('asyncHandler', () => {
		it('should call async function and handle success', async () => {
			const req = mockRequest() as Request
			const res = mockResponse() as Response
			const next = mockNext()

			const asyncFn = jest.fn().mockResolvedValue({ success: true })
			const wrappedFn = asyncHandler(asyncFn)

			await wrappedFn(req, res, next)

			expect(asyncFn).toHaveBeenCalledWith(req, res, next)
			expect(next).not.toHaveBeenCalled()
		})

		it('should catch async errors and pass to next', async () => {
			const req = mockRequest() as Request
			const res = mockResponse() as Response
			const next = mockNext()

			const error = new Error('Async error')
			const asyncFn = jest.fn().mockRejectedValue(error)
			const wrappedFn = asyncHandler(asyncFn)

			await wrappedFn(req, res, next)

			expect(next).toHaveBeenCalledWith(error)
		})
	})

	// ========================================================================
	// notFoundHandler Tests
	// ========================================================================
	describe('notFoundHandler', () => {
		it('should return 404 with route info', () => {
			const req = mockRequest({
				method: 'POST',
				path: '/api/nonexistent',
			}) as Request
			const res = mockResponse() as Response

			notFoundHandler(req, res)

			expect(res.status).toHaveBeenCalledWith(404)
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: false,
					message: expect.stringContaining('/api/nonexistent'),
					code: 'ROUTE_NOT_FOUND',
				}),
			)
		})

		it('should include available endpoints', () => {
			const req = mockRequest() as Request
			const res = mockResponse() as Response

			notFoundHandler(req, res)

			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					availableEndpoints: expect.arrayContaining([
						expect.stringContaining('/api/products'),
						expect.stringContaining('/api/categories'),
					]),
				}),
			)
		})
	})
})
