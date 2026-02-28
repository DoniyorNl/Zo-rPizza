// frontend/lib/sentry.ts
// 🐛 SENTRY ERROR MONITORING - Frontend Integration

import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN
const NODE_ENV = process.env.NODE_ENV || 'development'

// ============================================================================
// INITIALIZE SENTRY (Client-side)
// ============================================================================

export const initSentry = () => {
	if (!SENTRY_DSN) {
		console.warn('⚠️  NEXT_PUBLIC_SENTRY_DSN not found. Error monitoring disabled.')
		return
	}

	Sentry.init({
		dsn: SENTRY_DSN,
		environment: NODE_ENV,

		// Performance Monitoring
		tracesSampleRate: NODE_ENV === 'production' ? 0.1 : 1.0,

		// Session Replay (optional - for debugging user sessions)
		replaysSessionSampleRate: 0.1, // 10% of sessions
		replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

		// Filter out sensitive data
		beforeSend(event, hint) {
			// Remove sensitive data from breadcrumbs
			if (event.breadcrumbs) {
				event.breadcrumbs = event.breadcrumbs.map(breadcrumb => {
					if (breadcrumb.data) {
						delete breadcrumb.data.password
						delete breadcrumb.data.token
						delete breadcrumb.data.authorization
					}
					return breadcrumb
				})
			}

			// Remove sensitive request data
			if (event.request?.data) {
				const data = event.request.data as any
				if (data.password) data.password = '[REDACTED]'
				if (data.token) data.token = '[REDACTED]'
			}

			return event
		},

		// Ignore certain errors
		ignoreErrors: [
			'ResizeObserver loop limit exceeded',
			'Non-Error promise rejection captured',
			'Network request failed',
			'Failed to fetch',
		],
	})

	console.log('✅ [SENTRY] Frontend initialized for environment:', NODE_ENV)
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
export const captureMessage = (
	message: string,
	level: 'info' | 'warning' | 'error' = 'info',
) => {
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
