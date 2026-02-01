/**
 * Tracking va xarita uchun default sozlamalar.
 * Test uchun: restoran manzili Kerkstraat 29, 4141 AT Leerdam (Niderlandiya).
 * O'zgartirish: .env.local da NEXT_PUBLIC_RESTAURANT_* qo'ying.
 */

export const RESTAURANT_DEFAULT_ADDRESS = 'Kerkstraat 29, 4141 AT Leerdam'

/** Leerdam (Kerkstraat 29 atrofi) – test uchun default restoran koordinatalari */
export const RESTAURANT_DEFAULT_LAT = 51.894
export const RESTAURANT_DEFAULT_LNG = 5.097

function getEnvNumber(key: string, fallback: number): number {
	const v = process.env[key]
	if (v != null && v !== '') {
		const n = parseFloat(v)
		if (!Number.isNaN(n)) return n
	}
	return fallback
}

function getEnvString(key: string, fallback: string): string {
	const v = process.env[key]
	if (v != null && v !== '') return v
	return fallback
}

/** Xaritada ishlatiladigan restoran nuqtasi (env bo‘yicha yoki default). */
export function getRestaurantLocation(): { lat: number; lng: number } {
	return {
		lat: getEnvNumber('NEXT_PUBLIC_RESTAURANT_LAT', RESTAURANT_DEFAULT_LAT),
		lng: getEnvNumber('NEXT_PUBLIC_RESTAURANT_LNG', RESTAURANT_DEFAULT_LNG),
	}
}

/** Restoran manzili matni (ko‘rsatish uchun). */
export function getRestaurantAddress(): string {
	return getEnvString('NEXT_PUBLIC_RESTAURANT_ADDRESS', RESTAURANT_DEFAULT_ADDRESS)
}
