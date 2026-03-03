// frontend/app/page.tsx
// 🍕 ZOR PIZZA - HOME PAGE (Server wrapper)
// Goal: improve LCP by SSR-loading products instead of client-only fetch.

import HomeClient, { type HomeProduct } from './home-client'
import { API_BASE_URL } from '@/lib/apiBaseUrl'

async function fetchProducts(): Promise<HomeProduct[]> {
	const controller = new AbortController()
	const timeout = setTimeout(() => controller.abort(), 5000)
	try {
		const res = await fetch(`${API_BASE_URL}/api/products`, {
			signal: controller.signal,
			next: { revalidate: 60 },
		})
		if (!res.ok) return []
		const json = (await res.json().catch(() => null)) as { data?: unknown }
		const data = json && typeof json === 'object' && Array.isArray((json as { data?: unknown }).data)
			? ((json as { data: unknown[] }).data as HomeProduct[])
			: []
		return data
	} catch {
		return []
	} finally {
		clearTimeout(timeout)
	}
}

export default async function HomePage() {
	const products = await fetchProducts()
	return <HomeClient initialProducts={products} />
}
