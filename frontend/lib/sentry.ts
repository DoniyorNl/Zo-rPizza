// frontend/lib/sentry.ts
// Stub when @sentry/nextjs is not installed (e.g. Next.js 16 compatibility).
// Re-enable when Sentry supports Next 16.

export const initSentry = () => {
	// No-op
}

export const captureException = (error: Error, context?: Record<string, unknown>) => {
	console.error('[Error]', error)
	if (context) console.error('[Context]', context)
}

export const captureMessage = (
	_message: string,
	_level: 'info' | 'warning' | 'error' = 'info',
) => {
	// No-op
}

export const setUserContext = (_user: { id: string; email?: string; name?: string }) => {
	// No-op
}

export const clearUserContext = () => {
	// No-op
}
