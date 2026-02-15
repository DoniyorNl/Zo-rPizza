/**
 * OSRM route API – yo'l masofasi va vaqt (driving).
 * CORS bo'lsa ishlatamiz, aks holda fallback.
 */
export interface OSRMRouteResult {
	roadDistanceKm: number
	durationMinutes: number
	coordinates: [number, number][] // [lng, lat] GeoJSON order
}

const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving'

export async function getRoute(
	from: { lat: number; lng: number },
	to: { lat: number; lng: number }
): Promise<OSRMRouteResult | null> {
	const coords = `${from.lng},${from.lat};${to.lng},${to.lat}`
	const url = `${OSRM_BASE}/${coords}?overview=full&geometries=geojson`
	try {
		const res = await fetch(url, {
			headers: { Accept: 'application/json' },
		})
		if (!res.ok) return null
		const data = await res.json()
		const route = data.routes?.[0]
		if (!route?.distance || !route?.duration) return null
		const coordinates: [number, number][] = route.geometry?.coordinates ?? []
		return {
			roadDistanceKm: route.distance / 1000,
			durationMinutes: Math.round(route.duration / 60),
			coordinates,
		}
	} catch {
		return null
	}
}
