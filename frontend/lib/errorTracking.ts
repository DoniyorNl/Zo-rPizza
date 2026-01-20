// =====================================
// 📁 FILE PATH: frontend/lib/errorTracking.ts
// 📊 ERROR TRACKING SERVICE
// =====================================

interface ErrorData {
	message: string
	stack?: string
	context?: Record<string, any>
	level?: 'error' | 'warning' | 'info'
	userId?: string
}

/**
 * Log error to backend
 */
export async function logError(error: Error | string, context?: Record<string, any>) {
	try {
		const errorData: ErrorData = {
			message: typeof error === 'string' ? error : error.message,
			stack: typeof error !== 'string' ? error.stack : undefined,
			context: {
				...context,
				url: typeof window !== 'undefined' ? window.location.href : undefined,
				userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
				timestamp: new Date().toISOString(),
			},
			level: 'error',
		}

		// Get user ID from localStorage
		if (typeof window !== 'undefined') {
			const firebaseUser = localStorage.getItem('firebaseUser')
			if (firebaseUser) {
				try {
					const user = JSON.parse(firebaseUser)
					errorData.userId = user.uid
				} catch (_) {
					// Ignore parse errors
				}
			}
		}

		// Log to console (development)
		if (process.env.NODE_ENV === 'development') {
			console.error('📊 Error logged:', errorData)
		}

		// Send to backend (production)
		if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) {
			await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/errors/log`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(errorData),
			}).catch(err => console.warn('Failed to send error to backend:', err))
		}
	} catch (err) {
		// Failsafe: don't let error logging crash the app
		console.warn('Error tracking failed:', err)
	}
}

/**
 * Log warning
 */
export function logWarning(message: string, context?: Record<string, any>) {
	try {
		if (process.env.NODE_ENV === 'development') {
			console.warn('⚠️ Warning:', message, context)
		}

		// Could send to backend for monitoring
	} catch (err) {
		console.warn('Warning logging failed:', err)
	}
}

/**
 * Log info (for tracking user actions, performance, etc.)
 */
export function logInfo(message: string, context?: Record<string, any>) {
	if (process.env.NODE_ENV === 'development') {
		console.log('ℹ️ Info:', message, context)
	}
}

/**
 * Track user action (analytics)
 */
export function trackAction(action: string, properties?: Record<string, any>) {
	if (process.env.NODE_ENV === 'development') {
		console.log('📊 Action:', action, properties)
	}

	// Send to analytics service (Google Analytics, Mixpanel, etc.)
	// if (typeof window !== 'undefined' && (window as any).gtag) {
	//   (window as any).gtag('event', action, properties)
	// }
}
