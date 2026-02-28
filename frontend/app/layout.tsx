// frontend/app/layout.tsx
// 🍕 ROOT LAYOUT – font CDN (production build barqarorligi uchun next/font emas)

import { AuthProvider } from '@/lib/AuthContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Footer } from '@/components/layout/Footer'
import { AnalyticsTracker } from '@/components/AnalyticsTracker'
import { PushNotificationPrompt } from '@/components/PushNotificationPrompt'
import { SpeedInsights } from '@vercel/speed-insights/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

// ============================================================================
// SENTRY INITIALIZATION (must be early!)
// ============================================================================
import { initSentry } from '@/lib/sentry'

if (typeof window !== 'undefined') {
	initSentry()
}

export const metadata: Metadata = {
	title: 'Zor Pizza - Eng Mazali Pitsalar',
	description: 'Tez yetkazib berish bilan eng mazali pitsalar',
	manifest: '/manifest.json',
	appleWebApp: {
		capable: true,
		statusBarStyle: 'default',
		title: 'Zor Pizza',
	},
	icons: {
		icon: '/icons/icon-192.png',
		apple: '/icons/icon-192.png',
	},
}

export const viewport: Viewport = {
	themeColor: '#ea580c',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

	return (
		<html lang='uz'>
			<head>
				<link rel='manifest' href='/manifest.json' />
				<meta name='theme-color' content='#ea580c' />
				<link rel='apple-touch-icon' href='/icons/icon-192.png' />
				<link rel='preconnect' href='https://fonts.googleapis.com' />
				<link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='anonymous' />
				{/* eslint-disable-next-line @next/next/no-page-custom-font */}
				<link
					href='https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
					rel='stylesheet'
				/>
				
				{/* Google Analytics 4 */}
				{gaId && (
					<>
						<script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
						<script
							dangerouslySetInnerHTML={{
								__html: `
									window.dataLayer = window.dataLayer || [];
									function gtag(){dataLayer.push(arguments);}
									gtag('js', new Date());
									gtag('config', '${gaId}', {
										page_path: window.location.pathname,
									});
								`,
							}}
						/>
					</>
				)}
			</head>
			<body className='font-sans antialiased flex flex-col min-h-screen'>
				<ErrorBoundary>
					<AuthProvider>
						<AnalyticsTracker />
						<PushNotificationPrompt />
						<div className='flex-1'>{children}</div>
						<Footer />
					</AuthProvider>
				</ErrorBoundary>
				<SpeedInsights />
			</body>
		</html>
	)
}
