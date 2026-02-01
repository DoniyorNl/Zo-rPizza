import { buildApiUrl } from '@/lib/apiBaseUrl'

export const apiFetch = (path: string, init?: RequestInit) => {
	const url = buildApiUrl(path)
	return fetch(url, init)
}
