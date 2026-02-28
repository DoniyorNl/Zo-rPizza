// frontend/__tests__/lib/etaCalculation.test.ts
// ⏱️ ETA CALCULATION TESTS

import {
	calculateETA,
	formatETA,
	getETADescription,
	type ETAResult,
} from '@/lib/etaCalculation'

describe('etaCalculation', () => {
	describe('calculateETA', () => {
		it('should return default ETA with base params', () => {
			const result = calculateETA({})
			expect(result.estimatedMinutes).toBeGreaterThanOrEqual(20)
			expect(result.minMinutes).toBeLessThanOrEqual(result.maxMinutes)
			expect(result.breakdown).toHaveProperty('prepTime')
			expect(result.breakdown).toHaveProperty('deliveryTime')
			expect(result.breakdown).toHaveProperty('bufferTime')
		})

		it('should increase prep time for multiple products', () => {
			const single = calculateETA({ productCount: 1 })
			const multiple = calculateETA({ productCount: 5 })
			expect(multiple.breakdown.prepTime).toBeGreaterThan(single.breakdown.prepTime)
		})

		it('should add extra time for complex items', () => {
			const simple = calculateETA({ hasComplexItems: false })
			const complex = calculateETA({ hasComplexItems: true })
			expect(complex.breakdown.prepTime).toBeGreaterThan(simple.breakdown.prepTime)
		})

		it('should increase delivery time for longer distance', () => {
			const short = calculateETA({ distance: 1 })
			const long = calculateETA({ distance: 10 })
			expect(long.breakdown.deliveryTime).toBeGreaterThan(short.breakdown.deliveryTime)
		})

		it('should add kitchen delay for active orders', () => {
			const noLoad = calculateETA({ activeOrdersCount: 0 })
			const withLoad = calculateETA({ activeOrdersCount: 5 })
			expect(withLoad.breakdown.prepTime).toBeGreaterThanOrEqual(noLoad.breakdown.prepTime)
		})

		it('should return min and max within range', () => {
			const result = calculateETA({ distance: 3, productCount: 1 })
			expect(result.minMinutes).toBeGreaterThanOrEqual(10)
			expect(result.maxMinutes - result.minMinutes).toBeLessThanOrEqual(10)
		})
	})

	describe('formatETA', () => {
		it('should format single value when min equals max', () => {
			const eta: ETAResult = {
				estimatedMinutes: 25,
				minMinutes: 25,
				maxMinutes: 25,
				breakdown: { prepTime: 15, deliveryTime: 6, bufferTime: 5 },
			}
			expect(formatETA(eta)).toBe('25 daqiqa')
		})

		it('should format range when min differs from max', () => {
			const eta: ETAResult = {
				estimatedMinutes: 25,
				minMinutes: 20,
				maxMinutes: 30,
				breakdown: { prepTime: 15, deliveryTime: 6, bufferTime: 5 },
			}
			expect(formatETA(eta)).toBe('20-30 daqiqa')
		})
	})

	describe('getETADescription', () => {
		it('should return tezkor for fast delivery', () => {
			const eta: ETAResult = {
				estimatedMinutes: 15,
				minMinutes: 10,
				maxMinutes: 20,
				breakdown: { prepTime: 8, deliveryTime: 2, bufferTime: 5 },
			}
			expect(getETADescription(eta)).toContain('Tezkor')
		})

		it('should return standart for medium delivery', () => {
			const eta: ETAResult = {
				estimatedMinutes: 25,
				minMinutes: 20,
				maxMinutes: 30,
				breakdown: { prepTime: 15, deliveryTime: 6, bufferTime: 5 },
			}
			expect(getETADescription(eta)).toContain('Standart')
		})

		it('should return band vaqt for slow delivery', () => {
			const eta: ETAResult = {
				estimatedMinutes: 45,
				minMinutes: 40,
				maxMinutes: 50,
				breakdown: { prepTime: 25, deliveryTime: 15, bufferTime: 5 },
			}
			expect(getETADescription(eta)).toContain('Band')
		})
	})
})
