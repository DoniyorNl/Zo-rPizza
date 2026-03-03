'use client'

import dynamic from 'next/dynamic'
import { AnalyticsTracker } from '@/components/AnalyticsTracker'

const PushNotificationPrompt = dynamic(
	() => import('@/components/PushNotificationPrompt').then(m => m.PushNotificationPrompt),
	{ ssr: false, loading: () => null },
)

export function ClientEnhancements() {
	return (
		<>
			<AnalyticsTracker />
			<PushNotificationPrompt />
		</>
	)
}

