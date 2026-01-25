// backend/src/utils/gps.utils.ts
/**
 * GPS Tracking Utilities
 * Distance calculation, ETA estimation, route optimization
 */

interface Location {
	lat: number
	lng: number
}

interface ETAOptions {
	preparationTime?: number
	trafficMultiplier?: number
	vehicleType?: 'bike' | 'car' | 'scooter'
}

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * @returns distance in kilometers
 */
export function calculateDistance(from: Location, to: Location): number {
	const R = 6371 // Earth's radius in km
	const dLat = toRad(to.lat - from.lat)
	const dLng = toRad(to.lng - from.lng)

	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)

	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
	const distance = R * c

	return Math.round(distance * 100) / 100
}

function toRad(degrees: number): number {
	return (degrees * Math.PI) / 180
}

/**
 * Calculate estimated delivery time
 * @returns ETA in minutes
 */
export function calculateETA(distance: number, options: ETAOptions = {}): number {
	const { preparationTime = 15, trafficMultiplier = 1.2, vehicleType = 'bike' } = options

	const speeds = {
		bike: 25,
		scooter: 30,
		car: 35,
	}

	const speed = speeds[vehicleType]
	const travelTimeHours = distance / speed
	const travelTimeMinutes = travelTimeHours * 60
	const adjustedTravelTime = travelTimeMinutes * trafficMultiplier
	const totalETA = preparationTime + adjustedTravelTime

	return Math.ceil(totalETA)
}

export function formatETA(minutes: number): string {
	if (minutes < 60) {
		return `${minutes} min`
	}
	const hours = Math.floor(minutes / 60)
	const mins = minutes % 60
	return `${hours}h ${mins}min`
}

export function isValidLocation(location: any): location is Location {
	return (
		location &&
		typeof location.lat === 'number' &&
		typeof location.lng === 'number' &&
		location.lat >= -90 &&
		location.lat <= 90 &&
		location.lng >= -180 &&
		location.lng <= 180
	)
}

export function getLocationTimestamp(): string {
	return new Date().toISOString()
}

export function isNearDestination(driverLocation: Location, destination: Location): boolean {
	const distance = calculateDistance(driverLocation, destination)
	return distance <= 0.5
}

export function formatLocation(location: Location): string {
	return `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`
}

export function generateNearbyLocation(center: Location, radiusKm: number = 5): Location {
	const r = radiusKm / 111
	const y0 = center.lat
	const x0 = center.lng
	const u = Math.random()
	const v = Math.random()
	const w = r * Math.sqrt(u)
	const t = 2 * Math.PI * v
	const x = w * Math.cos(t)
	const y = w * Math.sin(t)

	return {
		lat: y + y0,
		lng: x + x0,
	}
}
