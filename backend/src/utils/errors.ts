// =====================================
// 📁 FILE PATH: backend/src/utils/errors.ts
// ❌ ERROR CLASSES - Consistent error handling
// =====================================

/**
 * Base Application Error
 */
export class AppError extends Error {
	constructor(
		public statusCode: number,
		public message: string,
		public code: string,
		public isOperational = true,
	) {
		super(message)
		this.name = this.constructor.name
		Error.captureStackTrace(this, this.constructor)
	}
}

/**
 * 400 Bad Request - Invalid input
 */
export class BadRequestError extends AppError {
	constructor(message: string, code = 'BAD_REQUEST') {
		super(400, message, code)
	}
}

/**
 * 401 Unauthorized - Authentication required
 */
export class UnauthorizedError extends AppError {
	constructor(message = 'Autentifikatsiya talab qilinadi', code = 'UNAUTHORIZED') {
		super(401, message, code)
	}
}

/**
 * 403 Forbidden - Insufficient permissions
 */
export class ForbiddenError extends AppError {
	constructor(message = 'Sizda bu amalni bajarish uchun ruxsat yo\'q', code = 'FORBIDDEN') {
		super(403, message, code)
	}
}

/**
 * 404 Not Found - Resource not found
 */
export class NotFoundError extends AppError {
	constructor(resource: string, code = 'NOT_FOUND') {
		super(404, `${resource} topilmadi`, code)
	}
}

/**
 * 409 Conflict - Resource already exists
 */
export class ConflictError extends AppError {
	constructor(message: string, code = 'CONFLICT') {
		super(409, message, code)
	}
}

/**
 * 422 Unprocessable Entity - Validation error
 */
export class ValidationError extends AppError {
	constructor(
		message: string,
		public errors: Record<string, string>,
		code = 'VALIDATION_ERROR',
	) {
		super(422, message, code)
	}
}

/**
 * 429 Too Many Requests - Rate limit exceeded
 */
export class RateLimitError extends AppError {
	constructor(message = 'Juda ko\'p so\'rov. Keyinroq urinib ko\'ring', code = 'RATE_LIMIT') {
		super(429, message, code)
	}
}

/**
 * 500 Internal Server Error - Unexpected errors
 */
export class InternalServerError extends AppError {
	constructor(message = 'Ichki server xatosi', code = 'INTERNAL_ERROR', isOperational = false) {
		super(500, message, code, isOperational)
	}
}

/**
 * Error response formatter
 */
export interface ErrorResponse {
	success: false
	message: string
	code: string
	errors?: Record<string, string>
	stack?: string
	timestamp: string
}

export function formatErrorResponse(error: AppError, includeStack = false): ErrorResponse {
	const response: ErrorResponse = {
		success: false,
		message: error.message,
		code: error.code,
		timestamp: new Date().toISOString(),
	}

	if (error instanceof ValidationError) {
		response.errors = error.errors
	}

	if (includeStack && error.stack) {
		response.stack = error.stack
	}

	return response
}

/**
 * Check if error is operational (expected) or programming error (unexpected)
 */
export function isOperationalError(error: Error): boolean {
	if (error instanceof AppError) {
		return error.isOperational
	}
	return false
}
