import withPWAInit from '@ducanh2912/next-pwa'
import type { NextConfig } from 'next'

const withPWA = withPWAInit({
	dest: 'public',
	cacheOnFrontEndNav: true,
	aggressiveFrontEndNavCaching: true,
	reloadOnOnline: true,
	disable: false,
	workboxOptions: {
		disableDevLogs: true,
	},
})

const nextConfig: NextConfig = {
	turbopack: {
		root: '..',
	},
	// Firebase Google Sign-in popup uchun COOP sozlash (Cross-Origin-Opener-Policy warning'ni bartaraf etish)
	async headers() {
		return [
			{
				source: '/:path*',
				headers: [
					{
						key: 'Cross-Origin-Opener-Policy',
						value: 'same-origin-allow-popups',
					},
				],
			},
		]
	},
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'images.unsplash.com',
			},
			{
				protocol: 'https',
				hostname: 'example.com',
			},
			{
				protocol: 'https',
				hostname: '**.example.com',
			},
		],
	},
}

export default withPWA(nextConfig)
