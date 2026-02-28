// frontend/components/AnalyticsTracker.tsx
// 📊 ANALYTICS TRACKER - Auto-track all page views

'use client'

import { usePageTracking } from '@/hooks/useAnalyticsTracking'

export function AnalyticsTracker() {
	usePageTracking()
	return null
}
