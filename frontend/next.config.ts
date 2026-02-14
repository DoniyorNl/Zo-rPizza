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
