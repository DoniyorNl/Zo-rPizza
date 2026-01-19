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
		const headers = AxiosHeaders.from(config.headers ?? {})
		
		// 1. Firebase token (Authorization header) - localStorage'dan olish
		const firebaseToken = localStorage.getItem('firebaseToken')
		if (firebaseToken && !headers.has('Authorization')) {
			headers.set('Authorization', `Bearer ${firebaseToken}`)
		}
		
		// 2. User ID (x-user-id header) - backup/fallback
		const firebaseUser = localStorage.getItem('firebaseUser')
		const userId = firebaseUser ? JSON.parse(firebaseUser).uid : null
		if (userId && !headers.has('x-user-id')) {
			headers.set('x-user-id', userId)
		}
		
		config.headers = headers
	}
	return config
})

// Error interceptor - 401 xatolik bo'lganda token refresh qilish
api.interceptors.response.use(
	response => response,
	async error => {
		const originalRequest = error.config

		// Agar 401 xatolik bo'lsa va retry qilinmagan bo'lsa
		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true

			try {
				// Firebase'dan yangi token olish
				if (typeof window !== 'undefined') {
					const { auth } = await import('./firebase')
					const currentUser = auth.currentUser
					
					if (currentUser) {
						const newToken = await currentUser.getIdToken(true) // Force refresh
						localStorage.setItem('firebaseToken', newToken)
						
						// Yangi token bilan requestni qayta yuborish
						const headers = AxiosHeaders.from(originalRequest.headers ?? {})
						headers.set('Authorization', `Bearer ${newToken}`)
						originalRequest.headers = headers
						
						return api(originalRequest)
					}
				}
			} catch (refreshError) {
				console.error('❌ Token refresh failed:', refreshError)
				// Token refresh qila olmasak, login page'ga yo'naltirish
				if (typeof window !== 'undefined') {
					localStorage.removeItem('firebaseToken')
					localStorage.removeItem('firebaseUser')
					window.location.href = '/login'
				}
				return Promise.reject(refreshError)
			}
		}

		return Promise.reject(error)
	}
)
