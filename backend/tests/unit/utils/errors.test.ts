// backend/tests/unit/utils/errors.test.ts
// ❌ ERROR UTILITIES TESTS - Error Classes & Helpers

import {
	AppError,
	BadRequestError,
	UnauthorizedError,
	ForbiddenError,
	NotFoundError,
	ConflictError,
	ValidationError,
	RateLimitError,
	InternalServerError,
	formatErrorResponse,
	isOperationalError,
} from '../../../src/utils/errors'

describe('Error Utilities', () => {
	describe('AppError', () => {
		it('should create AppError with correct properties', () => {
			const error = new AppError(400, 'Test error', 'TEST_ERROR')

			expect(error).toBeInstanceOf(Error)
			expect(error).toBeInstanceOf(AppError)
			expect(error.statusCode).toBe(400)
			expect(error.message).toBe('Test error')
			expect(error.code).toBe('TEST_ERROR')
			expect(error.isOperational).toBe(true)
			expect(error.name).toBe('AppError')
		})

		it('should capture stack trace', () => {
			const error = new AppError(500, 'Test', 'TEST')
			expect(error.stack).toBeDefined()
		})

		it('should allow non-operational flag', () => {
			const error = new AppError(500, 'Critical', 'CRITICAL', false)
			expect(error.isOperational).toBe(false)
		})
	})

	describe('BadRequestError', () => {
		it('should create 400 error', () => {
			const error = new BadRequestError('Invalid input')

			expect(error.statusCode).toBe(400)
			expect(error.message).toBe('Invalid input')
			expect(error.code).toBe('BAD_REQUEST')
			expect(error.isOperational).toBe(true)
		})

		it('should allow custom code', () => {
			const error = new BadRequestError('Invalid', 'CUSTOM_CODE')
			expect(error.code).toBe('CUSTOM_CODE')
		})
	})

	describe('UnauthorizedError', () => {
		it('should create 401 error with default message', () => {
			const error = new UnauthorizedError()

			expect(error.statusCode).toBe(401)
			expect(error.message).toBe('Autentifikatsiya talab qilinadi')
			expect(error.code).toBe('UNAUTHORIZED')
		})

		it('should allow custom message', () => {
			const error = new UnauthorizedError('Custom auth message')
			expect(error.message).toBe('Custom auth message')
		})
	})

	describe('ForbiddenError', () => {
		it('should create 403 error', () => {
			const error = new ForbiddenError()

			expect(error.statusCode).toBe(403)
			expect(error.code).toBe('FORBIDDEN')
		})

		it('should allow custom message', () => {
			const error = new ForbiddenError('No permission')
			expect(error.message).toBe('No permission')
		})
	})

	describe('NotFoundError', () => {
		it('should create 404 error with resource name', () => {
			const error = new NotFoundError('User')

			expect(error.statusCode).toBe(404)
			expect(error.message).toBe('User topilmadi')
			expect(error.code).toBe('NOT_FOUND')
		})

		it('should allow custom code', () => {
			const error = new NotFoundError('Product', 'PRODUCT_NOT_FOUND')
			expect(error.code).toBe('PRODUCT_NOT_FOUND')
		})
	})

	describe('ConflictError', () => {
		it('should create 409 error', () => {
			const error = new ConflictError('Already exists')

			expect(error.statusCode).toBe(409)
			expect(error.message).toBe('Already exists')
			expect(error.code).toBe('CONFLICT')
		})
	})

	describe('ValidationError', () => {
		it('should create 422 error with validation errors', () => {
			const errors = {
				email: 'Invalid email format',
				password: 'Password too short',
			}
			const error = new ValidationError('Validation failed', errors)

			expect(error.statusCode).toBe(422)
			expect(error.message).toBe('Validation failed')
			expect(error.code).toBe('VALIDATION_ERROR')
			expect(error.errors).toEqual(errors)
		})
	})

	describe('RateLimitError', () => {
		it('should create 429 error', () => {
			const error = new RateLimitError()

			expect(error.statusCode).toBe(429)
			expect(error.message).toContain('ko\'p so\'rov')
			expect(error.code).toBe('RATE_LIMIT')
		})
	})

	describe('InternalServerError', () => {
		it('should create 500 error', () => {
			const error = new InternalServerError()

			expect(error.statusCode).toBe(500)
			expect(error.code).toBe('INTERNAL_ERROR')
			expect(error.isOperational).toBe(false)
		})

		it('should allow operational flag', () => {
			const error = new InternalServerError('Server error', 'ERROR', true)
			expect(error.isOperational).toBe(true)
		})
	})

	describe('formatErrorResponse', () => {
		it('should format basic error response', () => {
			const error = new BadRequestError('Test error')
			const response = formatErrorResponse(error)

			expect(response).toEqual({
				success: false,
				message: 'Test error',
				code: 'BAD_REQUEST',
				timestamp: expect.any(String),
			})
		})

		it('should include validation errors', () => {
			const errors = { field: 'Invalid' }
			const error = new ValidationError('Validation failed', errors)
			const response = formatErrorResponse(error)

			expect(response.errors).toEqual(errors)
		})

		it('should include stack trace when requested', () => {
			const error = new AppError(500, 'Test', 'TEST')
			const response = formatErrorResponse(error, true)

			expect(response.stack).toBeDefined()
		})

		it('should not include stack trace by default', () => {
			const error = new AppError(500, 'Test', 'TEST')
			const response = formatErrorResponse(error, false)

			expect(response.stack).toBeUndefined()
		})

		it('should include timestamp', () => {
			const error = new AppError(400, 'Test', 'TEST')
			const response = formatErrorResponse(error)

			expect(response.timestamp).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
		})
	})

	describe('isOperationalError', () => {
		it('should return true for operational AppError', () => {
			const error = new AppError(400, 'Test', 'TEST', true)
			expect(isOperationalError(error)).toBe(true)
		})

		it('should return false for non-operational AppError', () => {
			const error = new AppError(500, 'Test', 'TEST', false)
			expect(isOperationalError(error)).toBe(false)
		})

		it('should return false for generic Error', () => {
			const error = new Error('Generic error')
			expect(isOperationalError(error)).toBe(false)
		})

		it('should return true for BadRequestError', () => {
			const error = new BadRequestError('Test')
			expect(isOperationalError(error)).toBe(true)
		})

		it('should return false for InternalServerError by default', () => {
			const error = new InternalServerError()
			expect(isOperationalError(error)).toBe(false)
		})
	})
})
