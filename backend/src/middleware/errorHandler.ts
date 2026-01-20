// =====================================
// 📁 FILE PATH: backend/src/middleware/errorHandler.ts
// ❌ GLOBAL ERROR HANDLER MIDDLEWARE
// =====================================

import { Request, Response, NextFunction } from 'express'
import { AppError, formatErrorResponse, isOperationalError } from '../utils/errors'
import { logError } from '../utils/logger'

/**
 * Global error handler middleware
 * Must be registered AFTER all routes
 */
export const errorHandler = (
	err: Error,
	req: Request,
	res: Response,
	_next: NextFunction,
) => {
	// Log error
	logError(err, {
		method: req.method,
		path: req.path,
		ip: req.ip,
		userId: (req as any).userId,
	})

	// Default to 500 Internal Server Error
	let statusCode = 500
	let errorResponse

	// Handle known application errors
	if (err instanceof AppError) {
		statusCode = err.statusCode
		errorResponse = formatErrorResponse(err, process.env.NODE_ENV === 'development')
	} else {
		// Unexpected error
		errorResponse = {
			success: false,
			message:
				process.env.NODE_ENV === 'production'
					? 'Ichki server xatosi'
					: err.message || 'Ichki server xatosi',
			code: 'INTERNAL_ERROR',
			timestamp: new Date().toISOString(),
			...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
		}
	}

	// Send response
	res.status(statusCode).json(errorResponse)

	// If it's not operational, exit the process (let PM2/Docker restart it)
	if (!isOperationalError(err) && process.env.NODE_ENV === 'production') {
		process.exit(1)
	}
}

/**
 * Async handler wrapper
 * Catches async errors and passes them to error handler
 */
export const asyncHandler =
	(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
	(req: Request, res: Response, next: NextFunction) => {
		Promise.resolve(fn(req, res, next)).catch(next)
	}

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: Request, res: Response) => {
	res.status(404).json({
		success: false,
		message: `Route topilmadi: ${req.method} ${req.path}`,
		code: 'ROUTE_NOT_FOUND',
		timestamp: new Date().toISOString(),
		availableEndpoints: [
			'GET /api',
			'GET /health',
			'GET /api/products',
			'GET /api/categories',
			'POST /api/orders',
			'GET /api/auth/me',
		],
	})
}
