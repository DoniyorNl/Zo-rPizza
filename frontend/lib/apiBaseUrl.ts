/**
 * Yagona API base URL manbai.
 * Barcha API chaqiruqlari shu modul orqali base URL olishi kerak.
 */

const PRODUCTION_FALLBACK = 'https://zo-rpizza-production.up.railway.app'
const LOCAL_API = 'http://localhost:5001'

const isLocalHost = (host: string) =>
	host === 'localhost' || host === '127.0.0.1'

function getApiBaseUrl(): string {
	const productionUrl = process.env.NEXT_PUBLIC_API_URL || PRODUCTION_FALLBACK
	const useProductionApi = process.env.NEXT_PUBLIC_USE_PRODUCTION_API === 'true'
	const isDevelopment = process.env.NODE_ENV === 'development'

	// Brauzerda: localhost yoki 127.0.0.1 da local backend ishlatamiz
	if (typeof window !== 'undefined' && isLocalHost(window.location.hostname)) {
		if (useProductionApi) {
			if (isDevelopment) console.warn('⚠️ Using production API in development mode')
			return productionUrl.replace(/\/+$/, '')
		}
		if (isDevelopment) console.log('🔧 Using local backend:', LOCAL_API)
		return LOCAL_API
	}

	if (typeof window !== 'undefined' && isDevelopment) {
		console.log('🚀 Using production backend:', productionUrl)
	}
	return productionUrl.replace(/\/+$/, '')
}

/** Build full URL for a path (path / bilan yoki siz berasiz). */
export function buildApiUrl(path: string): string {
	const base = getApiBaseUrl()
	const normalizedPath = path.startsWith('/') ? path : `/${path}`
	return `${base}${normalizedPath}`
}

/** Server yoki ilk yuklanishda ishlatish uchun (SSR). Developmentda local backend. */
export const API_BASE_URL =
	typeof window !== 'undefined'
		? getApiBaseUrl()
		: process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_API_URL
			? LOCAL_API
			: (process.env.NEXT_PUBLIC_API_URL || PRODUCTION_FALLBACK).replace(/\/+$/, '')

export { getApiBaseUrl }
