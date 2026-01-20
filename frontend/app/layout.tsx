// frontend/app/layout.tsx
// 🍕 ROOT LAYOUT

import { AuthProvider } from '@/lib/AuthContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { SpeedInsights } from '@vercel/speed-insights/next'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

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
	return (
		<html lang='uz'>
			<head>
				<link rel='manifest' href='/manifest.json' />
				<meta name='theme-color' content='#ea580c' />
				<link rel='apple-touch-icon' href='/icons/icon-192.png' />
			</head>
			<body className={inter.className}>
				<ErrorBoundary>
					<AuthProvider>{children}</AuthProvider>
				</ErrorBoundary>
				<SpeedInsights />
			</body>
		</html>
	)
}
