// frontend/app/layout.tsx
// 🍕 ROOT LAYOUT – Self-hosted fonts for better performance

import { AuthProvider } from '@/lib/AuthContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Footer } from '@/components/layout/Footer'
import { AnalyticsTracker } from '@/components/AnalyticsTracker'
import { PushNotificationPrompt } from '@/components/PushNotificationPrompt'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Inter } from 'next/font/google'
import type { Metadata, Viewport } from 'next'
import './globals.css'

// ============================================================================
// FONT OPTIMIZATION - Self-hosted Inter font
// ============================================================================
const inter = Inter({
	subsets: ['latin', 'latin-ext'],
	display: 'swap', // FOUT (Flash of Unstyled Text) instead of FOIT
	preload: true,
	variable: '--font-inter',
	weight: ['400', '500', '600', '700'], // Only weights we use
})

// ============================================================================
// SENTRY INITIALIZATION (must be early!)
// ============================================================================
import { initSentry } from '@/lib/sentry'

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
	initSentry()
}

export const metadata: Metadata = {
	title: 'Zor Pizza - Eng Mazali Pitsalar',
	description: 'Tez yetkazib berish bilan eng mazali pitsalar. 30 daqiqada eshigingizgacha yetkazamiz!',
	keywords: ['pitsa', 'pizza', 'yetkazib berish', 'tez', 'Toshkent', 'online buyurtma'],
	authors: [{ name: 'Zor Pizza' }],
	manifest: '/manifest.json',
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			'max-video-preview': -1,
			'max-image-preview': 'large',
			'max-snippet': -1,
		},
	},
	openGraph: {
		type: 'website',
		locale: 'uz_UZ',
		url: 'https://zorpizza.uz',
		title: 'Zor Pizza - Eng Mazali Pitsalar',
		description: 'Tez yetkazib berish bilan eng mazali pitsalar',
		siteName: 'Zor Pizza',
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Zor Pizza - Eng Mazali Pitsalar',
		description: 'Tez yetkazib berish bilan eng mazali pitsalar',
	},
	appleWebApp: {
		capable: true,
		statusBarStyle: 'default',
		title: 'Zor Pizza',
	},
	icons: {
		icon: [
			{ url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
			{ url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
		],
		apple: '/icons/icon-192.png',
	},
	verification: {
		google: 'your-google-verification-code',
	},
}

export const viewport: Viewport = {
	themeColor: '#ea580c',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

	return (
		<html lang='uz' className={inter.variable}>
			<head>
				{/* Resource Hints - Critical for performance */}
				<link rel='preconnect' href='https://www.googletagmanager.com' />
				<link rel='dns-prefetch' href='https://www.googletagmanager.com' />
				<link rel='preconnect' href='https://images.unsplash.com' />
				<link rel='dns-prefetch' href='https://images.unsplash.com' />
				
				{/* PWA Manifest */}
				<link rel='manifest' href='/manifest.json' />
				<meta name='theme-color' content='#ea580c' media='(prefers-color-scheme: light)' />
				<meta name='theme-color' content='#c2410c' media='(prefers-color-scheme: dark)' />
				
				{/* Apple Touch Icons */}
				<link rel='apple-touch-icon' href='/icons/icon-192.png' />
				<meta name='apple-mobile-web-app-capable' content='yes' />
				<meta name='apple-mobile-web-app-status-bar-style' content='default' />
				
				{/* Mobile Optimization */}
				<meta name='format-detection' content='telephone=no' />
				<meta name='mobile-web-app-capable' content='yes' />
				
				{/* Google Analytics 4 - Deferred Load with requestIdleCallback */}
				{gaId && process.env.NODE_ENV === 'production' && (
					<>
						<script
							dangerouslySetInnerHTML={{
								__html: `
									window.dataLayer = window.dataLayer || [];
									function gtag(){dataLayer.push(arguments);}
									gtag('js', new Date());
									gtag('config', '${gaId}', {
										page_path: window.location.pathname,
									});
									
									// Defer GA script loading until browser is idle
									if ('requestIdleCallback' in window) {
										requestIdleCallback(function() {
											var script = document.createElement('script');
											script.async = true;
											script.src = 'https://www.googletagmanager.com/gtag/js?id=${gaId}';
											document.head.appendChild(script);
										});
									} else {
										setTimeout(function() {
											var script = document.createElement('script');
											script.async = true;
											script.src = 'https://www.googletagmanager.com/gtag/js?id=${gaId}';
											document.head.appendChild(script);
										}, 2000);
									}
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
						<main className='flex-1' role='main'>{children}</main>
						<Footer />
					</AuthProvider>
				</ErrorBoundary>
				{process.env.NODE_ENV === 'production' && <SpeedInsights />}
			</body>
		</html>
	)
}
