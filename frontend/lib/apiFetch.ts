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

export const apiFetch = (path: string, init?: RequestInit) => {
	const baseUrl = getSmartApiUrl()
	const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`
	return fetch(url, init)
}
