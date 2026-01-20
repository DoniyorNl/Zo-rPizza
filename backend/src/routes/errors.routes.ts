// =====================================
// 📁 FILE PATH: backend/src/routes/errors.routes.ts
// ❌ ERROR LOGGING ROUTES
// =====================================

import { Router, Request, Response } from 'express'
import { logError, logInfo } from '../utils/logger'

const router = Router()

/**
 * POST /api/errors/log
 * Frontend'dan error log'larni qabul qilish
 */
router.post('/log', async (req: Request, res: Response) => {
	try {
		const { message, stack, context, level, userId } = req.body

		// Log to Winston
		const errorLog = {
			message: message || 'Frontend error',
			stack,
			context: {
				...context,
				userId,
				source: 'frontend',
			},
		}

		if (level === 'error') {
			logError(new Error(message), errorLog)
		} else {
			logInfo(`Frontend ${level}: ${message}`, errorLog)
		}

		res.status(200).json({
			success: true,
			message: 'Error logged successfully',
		})
	} catch (error) {
		console.error('Error logging endpoint failed:', error)
		res.status(500).json({
			success: false,
			message: 'Failed to log error',
		})
	}
})

export default router
