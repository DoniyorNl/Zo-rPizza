import axios from 'axios'

// Smart API URL detection for both localhost and production
const getSmartApiUrl = (): string => {
	// Production URL
	const productionUrl = process.env.NEXT_PUBLIC_API_URL || 'https://zo-rpizza-production.up.railway.app'
	
	// If running on localhost in browser, use local backend
	if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
		return 'http://localhost:5001'
	}
	
	// Otherwise use production
	return productionUrl.replace(/\/+$/, '')
}

export const API_BASE_URL = getSmartApiUrl()

export const getApiBaseUrl = (): string => {
	if (!API_BASE_URL) {
		throw new Error('API_BASE_URL could not be determined')
	}
	return API_BASE_URL
}

export const buildApiUrl = (path: string): string => {
	const base = getApiBaseUrl()
	const normalizedPath = path.startsWith('/') ? path : `/${path}`
	return `${base}${normalizedPath}`
}

// Axios instance
const api = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		'Content-Type': 'application/json',
	},
})

export default api
