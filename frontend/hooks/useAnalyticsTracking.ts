// frontend/hooks/useAnalyticsTracking.ts
// 📊 ANALYTICS TRACKING HOOK - Auto-track page views and user interactions

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { trackPageView } from '@/lib/analytics'

/**
 * Hook to automatically track page views
 * Usage: Call once in layout or per-page
 */
export const usePageTracking = () => {
	const pathname = usePathname()
	const searchParams = useSearchParams()

	useEffect(() => {
		if (pathname) {
			const url = `${pathname}${searchParams ? `?${searchParams.toString()}` : ''}`
			trackPageView(url)
		}
	}, [pathname, searchParams])
}

/**
 * Hook to track user engagement time on page
 */
export const useEngagementTracking = () => {
	useEffect(() => {
		const startTime = Date.now()

		return () => {
			const endTime = Date.now()
			const engagementTime = Math.floor((endTime - startTime) / 1000) // seconds

			// Track only if user stayed more than 5 seconds
			if (engagementTime > 5 && typeof window !== 'undefined' && window.gtag) {
				window.gtag('event', 'user_engagement', {
					engagement_time_msec: engagementTime * 1000,
				})
			}
		}
	}, [])
}
