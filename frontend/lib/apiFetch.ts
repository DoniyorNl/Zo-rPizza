import { buildApiUrl } from './api'

export const apiFetch = (path: string, init?: RequestInit) => fetch(buildApiUrl(path), init)
