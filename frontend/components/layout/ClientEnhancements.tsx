'use client'

import dynamic from 'next/dynamic'
const AnalyticsTracker = dynamic(() => import('@/components/AnalyticsTracker').then(m => m.AnalyticsTracker), {
	ssr: false,
	loading: () => null,
})

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

