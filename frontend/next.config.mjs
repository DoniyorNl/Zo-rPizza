import withPWAInit from '@ducanh2912/next-pwa'
import withBundleAnalyzer from '@next/bundle-analyzer'
import { fileURLToPath } from 'node:url'

const withPWA = withPWAInit({
	dest: 'public',
	cacheOnFrontEndNav: true,
	aggressiveFrontEndNavCaching: true,
	reloadOnOnline: true,
	disable: process.env.NODE_ENV === 'development',
	workboxOptions: {
		disableDevLogs: true,
	},
})

const withAnalyzer = withBundleAnalyzer({
	enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
	poweredByHeader: false,
	compress: true,
	outputFileTracingRoot: fileURLToPath(new URL('..', import.meta.url)),
	experimental: {
		optimizePackageImports: ['lucide-react', 'framer-motion'],
	},
	async headers() {
		return [
			{
				source: '/:path*',
				headers: [
					{ key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
					{ key: 'X-DNS-Prefetch-Control', value: 'on' },
					{ key: 'X-Frame-Options', value: 'SAMEORIGIN' },
					{ key: 'X-Content-Type-Options', value: 'nosniff' },
					{ key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
				],
			},
		]
	},
	images: {
		formats: ['image/avif', 'image/webp'],
		deviceSizes: [640, 750, 828, 1080, 1200, 1920],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
		minimumCacheTTL: 60,
		dangerouslyAllowSVG: true,
		contentDispositionType: 'inline',
		contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
		remotePatterns: [
			{ protocol: 'https', hostname: 'images.unsplash.com' },
			{ protocol: 'https', hostname: 'example.com' },
			{ protocol: 'https', hostname: '**.example.com' },
		],
	},
}

export default withAnalyzer(withPWA(nextConfig))
