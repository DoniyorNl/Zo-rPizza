import axios, { AxiosHeaders } from 'axios'
import { getApiBaseUrl } from './api'

export const api = axios.create({
	withCredentials: true,
	timeout: 20000,
})

api.interceptors.request.use(config => {
	const baseUrl = getApiBaseUrl().replace(/\/+$/, '')
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
