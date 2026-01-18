import axios, { AxiosHeaders } from 'axios'

// Smart API URL detection
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

export const api = axios.create({
	withCredentials: true,
	timeout: 20000,
})

api.interceptors.request.use(config => {
	const baseUrl = getSmartApiUrl()
	if (!config.baseURL) {
		config.baseURL = baseUrl
	}
	if (typeof window !== 'undefined') {
		const firebaseUser = localStorage.getItem('firebaseUser')
		const userId = firebaseUser ? JSON.parse(firebaseUser).uid : null
		if (userId) {
			const headers = AxiosHeaders.from(config.headers ?? {})
			if (!headers.has('x-user-id')) headers.set('x-user-id', userId)
			config.headers = headers
		}
	}
	return config
})
