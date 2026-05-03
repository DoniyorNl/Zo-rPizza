import axios, { AxiosHeaders } from 'axios'
import { getApiBaseUrl } from '@/lib/apiBaseUrl'

export const api = axios.create({
	withCredentials: true,
	timeout: 20000,
})

api.interceptors.request.use(async config => {
	const baseUrl = getApiBaseUrl()
	if (!config.baseURL) {
		config.baseURL = baseUrl
	}

	if (typeof window !== 'undefined') {
		const headers = AxiosHeaders.from(config.headers ?? {})

		if (!headers.has('Authorization')) {
			try {
				const { supabase } = await import('./supabase')
				const { data } = await supabase.auth.getSession()
				const token = data.session?.access_token
				if (token) {
					headers.set('Authorization', `Bearer ${token}`)
				}
			} catch {
				// Continue without token for public endpoints
			}
		}

		config.headers = headers
	}
	return config
})

// Auto-refresh on 401
api.interceptors.response.use(
	response => response,
	async error => {
		const originalRequest = error.config

		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true

			try {
				if (typeof window !== 'undefined') {
					const { supabase } = await import('./supabase')
					const { data, error: refreshError } = await supabase.auth.refreshSession()

					if (!refreshError && data.session) {
						const headers = AxiosHeaders.from(originalRequest.headers ?? {})
						headers.set('Authorization', `Bearer ${data.session.access_token}`)
						originalRequest.headers = headers
						return api(originalRequest)
					}
				}
			} catch (refreshErr) {
				console.error('❌ Token refresh failed:', refreshErr)
				if (typeof window !== 'undefined') {
					window.location.href = '/login'
				}
				return Promise.reject(refreshErr)
			}
		}

		return Promise.reject(error)
	},
)
