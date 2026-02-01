/**
 * OpenStreetMap Nominatim - manzildan koordinatalar olish (bepul)
 * @see https://nominatim.org/release-docs/develop/api/Search/
 */

export interface GeocodeResult {
	lat: number
	lng: number
	displayName?: string
}

export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
	if (!address || address.trim().length < 5) return null

	try {
		const encoded = encodeURIComponent(address.trim())
		const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`

		const res = await fetch(url, {
			headers: {
				'User-Agent': 'ZorPizza/1.0 (pizza delivery app)',
			},
		})

		if (!res.ok) return null

		const data = await res.json()
		if (!Array.isArray(data) || data.length === 0) return null

		const item = data[0]
		const lat = parseFloat(item.lat)
		const lng = parseFloat(item.lon)

		if (isNaN(lat) || isNaN(lng)) return null

		return {
			lat,
			lng,
			displayName: item.display_name,
		}
	} catch {
		return null
	}
}
