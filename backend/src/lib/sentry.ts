// backend/src/lib/sentry.ts
// 🐛 SENTRY ERROR MONITORING - Backend Integration

import * as Sentry from '@sentry/node'

const SENTRY_DSN = process.env.SENTRY_DSN
const NODE_ENV = process.env.NODE_ENV || 'development'

// ============================================================================
// INITIALIZE SENTRY
// ============================================================================

export const initSentry = () => {
	if (!SENTRY_DSN) {
		console.warn('⚠️  SENTRY_DSN not found. Error monitoring disabled.')
		return
	}

	Sentry.init({
		dsn: SENTRY_DSN,
		environment: NODE_ENV,
		
		// Performance Monitoring
		tracesSampleRate: NODE_ENV === 'production' ? 0.1 : 1.0, // 10% in prod, 100% in dev
		
		// Profiling
		profilesSampleRate: NODE_ENV === 'production' ? 0.1 : 1.0,
		
		// Filter out sensitive data
		beforeSend(event, hint) {
			// Remove sensitive headers
			if (event.request?.headers) {
				delete event.request.headers['authorization']
				delete event.request.headers['cookie']
			}
			
			// Remove sensitive data from body
			if (event.request?.data) {
				const data = event.request.data as any
				if (data.password) data.password = '[REDACTED]'
				if (data.token) data.token = '[REDACTED]'
			}
			
			return event
		},
		
		// Ignore certain errors
		ignoreErrors: [
			'ECONNREFUSED',
			'ENOTFOUND',
			'Network Error',
			'timeout',
		],
	})

	console.log('✅ [SENTRY] Initialized for environment:', NODE_ENV)
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Capture exception with context
 */
export const captureException = (error: Error, context?: Record<string, any>) => {
	if (SENTRY_DSN) {
		Sentry.withScope(scope => {
			if (context) {
				Object.entries(context).forEach(([key, value]) => {
					scope.setContext(key, value)
				})
			}
			Sentry.captureException(error)
		})
	} else {
		console.error('[SENTRY SIMULATION] Exception:', error)
		if (context) console.error('[SENTRY SIMULATION] Context:', context)
	}
}

/**
 * Capture message (non-error events)
 */
export const captureMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info') => {
	if (SENTRY_DSN) {
		Sentry.captureMessage(message, level)
	} else {
		console.log(`[SENTRY SIMULATION] ${level.toUpperCase()}: ${message}`)
	}
}

/**
 * Set user context for error tracking
 */
export const setUserContext = (user: { id: string; email?: string; name?: string }) => {
	if (SENTRY_DSN) {
		Sentry.setUser({
			id: user.id,
			email: user.email,
			username: user.name,
		})
	}
}

/**
 * Clear user context (on logout)
 */
export const clearUserContext = () => {
	if (SENTRY_DSN) {
		Sentry.setUser(null)
	}
}
