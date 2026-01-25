// backend/tests/unit/utils/gps.utils.test.ts
import {
	calculateDistance,
	calculateETA,
	formatETA,
	isValidLocation,
	isNearDestination,
	generateNearbyLocation,
} from '../../../src/utils/gps.utils'

describe('GPS Utils', () => {
	describe('calculateDistance', () => {
		it('should calculate distance between two locations correctly', () => {
			const tashkent = { lat: 41.2995, lng: 69.2401 }
			const samarkand = { lat: 39.627, lng: 66.975 }

			const distance = calculateDistance(tashkent, samarkand)

			expect(distance).toBeGreaterThan(265)
			expect(distance).toBeLessThan(270)
		})

		it('should return 0 for same location', () => {
			const location = { lat: 41.2995, lng: 69.2401 }
			const distance = calculateDistance(location, location)

			expect(distance).toBe(0)
		})

		it('should calculate short distances accurately', () => {
			const point1 = { lat: 41.3, lng: 69.24 }
			const point2 = { lat: 41.309, lng: 69.24 }

			const distance = calculateDistance(point1, point2)

			expect(distance).toBeGreaterThan(0.9)
			expect(distance).toBeLessThan(1.1)
		})
	})

	describe('calculateETA', () => {
		it('should calculate ETA for bike delivery', () => {
			const distance = 5
			const eta = calculateETA(distance, {
				vehicleType: 'bike',
				preparationTime: 15,
				trafficMultiplier: 1.2,
			})

			expect(eta).toBeGreaterThan(25)
			expect(eta).toBeLessThan(35)
		})

		it('should calculate ETA for car delivery', () => {
			const distance = 10
			const eta = calculateETA(distance, {
				vehicleType: 'car',
				preparationTime: 20,
				trafficMultiplier: 1.0,
			})

			expect(eta).toBeGreaterThan(35)
			expect(eta).toBeLessThan(42)
		})

		it('should use default values when options not provided', () => {
			const distance = 3
			const eta = calculateETA(distance)

			expect(eta).toBeGreaterThan(0)
			expect(typeof eta).toBe('number')
		})

		it('should handle zero distance', () => {
			const eta = calculateETA(0, {
				preparationTime: 15,
			})

			expect(eta).toBe(15)
		})
	})

	describe('formatETA', () => {
		it('should format minutes correctly', () => {
			expect(formatETA(30)).toBe('30 min')
			expect(formatETA(45)).toBe('45 min')
		})

		it('should format hours and minutes correctly', () => {
			expect(formatETA(60)).toBe('1h 0min')
			expect(formatETA(90)).toBe('1h 30min')
			expect(formatETA(125)).toBe('2h 5min')
		})
	})

	describe('isValidLocation', () => {
		it('should validate correct locations', () => {
			expect(isValidLocation({ lat: 41.2995, lng: 69.2401 })).toBe(true)
			expect(isValidLocation({ lat: 0, lng: 0 })).toBe(true)
			expect(isValidLocation({ lat: -90, lng: -180 })).toBe(true)
			expect(isValidLocation({ lat: 90, lng: 180 })).toBe(true)
		})

		it('should reject invalid locations', () => {
			expect(isValidLocation({ lat: 91, lng: 0 })).toBe(false)
			expect(isValidLocation({ lat: 0, lng: 181 })).toBe(false)
			expect(isValidLocation({ lat: -91, lng: 0 })).toBe(false)
			expect(isValidLocation({ lat: 0, lng: -181 })).toBe(false)
			expect(isValidLocation(null as any)).toBe(false)
			expect(isValidLocation({} as any)).toBe(false)
		})
	})

	describe('isNearDestination', () => {
		it('should return true when driver is near', () => {
			const destination = { lat: 41.3, lng: 69.24 }
			const driverNear = { lat: 41.302, lng: 69.24 }

			expect(isNearDestination(driverNear, destination)).toBe(true)
		})

		it('should return false when driver is far', () => {
			const destination = { lat: 41.3, lng: 69.24 }
			const driverFar = { lat: 41.31, lng: 69.24 }

			expect(isNearDestination(driverFar, destination)).toBe(false)
		})
	})

	describe('generateNearbyLocation', () => {
		it('should generate location within specified radius', () => {
			const center = { lat: 41.3, lng: 69.24 }
			const radiusKm = 5

			const nearby = generateNearbyLocation(center, radiusKm)

			expect(typeof nearby.lat).toBe('number')
			expect(typeof nearby.lng).toBe('number')
			expect(isValidLocation(nearby)).toBe(true)

			const distance = calculateDistance(center, nearby)
			expect(distance).toBeLessThanOrEqual(radiusKm)
		})

		it('should use default radius if not specified', () => {
			const center = { lat: 41.3, lng: 69.24 }
			const nearby = generateNearbyLocation(center)

			expect(isValidLocation(nearby)).toBe(true)
		})
	})
})
