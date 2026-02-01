import axios from 'axios'
import { API_BASE_URL, getApiBaseUrl, buildApiUrl } from '@/lib/apiBaseUrl'

export { API_BASE_URL, getApiBaseUrl, buildApiUrl }

// Axios instance
const api = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		'Content-Type': 'application/json',
	},
})

export default api
