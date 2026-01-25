// backend/tests/unit/validators/validators.test.ts
// ✅ ALL VALIDATORS TESTS - Comprehensive Zod Schema Testing

import {
	createProductSchema,
	updateProductSchema,
} from '../../../src/validators/product.validator'
import {
	createCouponSchema,
	updateCouponSchema,
} from '../../../src/validators/coupon.validator'
import {
	createDealSchema,
	updateDealSchema,
} from '../../../src/validators/deal.validator'

// ============================================================================
// PRODUCT VALIDATOR TESTS
// ============================================================================

describe('Product Validator', () => {
	describe('createProductSchema', () => {
		it('should validate correct product data', () => {
			const validData = {
				name: 'Margherita Pizza',
				description: 'Classic Italian pizza',
				basePrice: 50000,
				prepTime: 20,
				categoryId: 'cat-123',
			}

			const result = createProductSchema.safeParse(validData)
			expect(result.success).toBe(true)
		})

		it('should validate product with variations', () => {
			const validData = {
				name: 'Pepperoni Pizza',
				description: 'Spicy pepperoni',
				basePrice: 60000,
				prepTime: 25,
				categoryId: 'cat-123',
				variations: [
					{ size: 'Small', price: 50000 },
					{ size: 'Medium', price: 70000 },
					{ size: 'Large', price: 90000 },
				],
			}

			const result = createProductSchema.safeParse(validData)
			expect(result.success).toBe(true)
		})

		it('should reject duplicate variation sizes', () => {
			const invalidData = {
				name: 'Pizza',
				description: 'Test',
				basePrice: 50000,
				prepTime: 20,
				categoryId: 'cat-123',
				variations: [
					{ size: 'Small', price: 50000 },
					{ size: 'Small', price: 60000 },
				],
			}

			const result = createProductSchema.safeParse(invalidData)
			expect(result.success).toBe(false)
		})

		it('should reject missing required fields', () => {
			const invalidData = {
				name: 'Pizza',
				// missing description, basePrice, prepTime, categoryId
			}

			const result = createProductSchema.safeParse(invalidData)
			expect(result.success).toBe(false)
		})

		it('should reject negative prices', () => {
			const invalidData = {
				name: 'Pizza',
				description: 'Test',
				basePrice: -50000,
				prepTime: 20,
				categoryId: 'cat-123',
			}

			const result = createProductSchema.safeParse(invalidData)
			expect(result.success).toBe(false)
		})

		it('should reject invalid URL for imageUrl', () => {
			const invalidData = {
				name: 'Pizza',
				description: 'Test',
				basePrice: 50000,
				prepTime: 20,
				categoryId: 'cat-123',
				imageUrl: 'not-a-url',
			}

			const result = createProductSchema.safeParse(invalidData)
			expect(result.success).toBe(false)
		})

		it('should accept optional fields', () => {
			const validData = {
				name: 'Pizza',
				description: 'Test',
				basePrice: 50000,
				prepTime: 20,
				categoryId: 'cat-123',
				calories: 800,
				protein: 30,
				carbs: 50,
				fat: 20,
				servings: 2,
			}

			const result = createProductSchema.safeParse(validData)
			expect(result.success).toBe(true)
		})

		it('should coerce string numbers to numbers', () => {
			const validData = {
				name: 'Pizza',
				description: 'Test',
				basePrice: '50000',
				prepTime: '20',
				categoryId: 'cat-123',
			}

			const result = createProductSchema.safeParse(validData)
			expect(result.success).toBe(true)
			if (result.success) {
				expect(typeof result.data.basePrice).toBe('number')
			}
		})
	})

	describe('updateProductSchema', () => {
		it('should validate partial updates', () => {
			const validData = {
				name: 'Updated Pizza Name',
			}

			const result = updateProductSchema.safeParse(validData)
			expect(result.success).toBe(true)
		})

		it('should reject duplicate variation sizes', () => {
			const invalidData = {
				variations: [
					{ size: 'Large', price: 90000 },
					{ size: 'Large', price: 95000 },
				],
			}

			const result = updateProductSchema.safeParse(invalidData)
			expect(result.success).toBe(false)
		})
	})
})

// ============================================================================
// COUPON VALIDATOR TESTS
// ============================================================================

describe('Coupon Validator', () => {
	describe('createCouponSchema', () => {
		it('should validate correct coupon data', () => {
			const validData = {
				code: 'SAVE20',
				description: '20% off',
				discountType: 'PERCENT',
				discountValue: 20,
			}

			const result = createCouponSchema.safeParse(validData)
			expect(result.success).toBe(true)
		})

		it('should validate FIXED discount type', () => {
			const validData = {
				code: 'SAVE10K',
				description: '10,000 som off',
				discountType: 'FIXED',
				discountValue: 10000,
			}

			const result = createCouponSchema.safeParse(validData)
			expect(result.success).toBe(true)
		})

		it('should reject invalid discount type', () => {
			const invalidData = {
				code: 'SAVE20',
				discountType: 'INVALID',
				discountValue: 20,
			}

			const result = createCouponSchema.safeParse(invalidData)
			expect(result.success).toBe(false)
		})

		it('should reject code shorter than 3 characters', () => {
			const invalidData = {
				code: 'AB',
				discountType: 'PERCENT',
				discountValue: 20,
			}

			const result = createCouponSchema.safeParse(invalidData)
			expect(result.success).toBe(false)
		})

		it('should validate date range', () => {
			const startsAt = new Date('2026-01-01')
			const endsAt = new Date('2026-12-31')

			const validData = {
				code: 'YEAR2026',
				discountType: 'PERCENT',
				discountValue: 10,
				startsAt,
				endsAt,
			}

			const result = createCouponSchema.safeParse(validData)
			expect(result.success).toBe(true)
		})

		it('should reject invalid date range (end before start)', () => {
			const startsAt = new Date('2026-12-31')
			const endsAt = new Date('2026-01-01')

			const invalidData = {
				code: 'INVALID',
				discountType: 'PERCENT',
				discountValue: 10,
				startsAt,
				endsAt,
			}

			const result = createCouponSchema.safeParse(invalidData)
			expect(result.success).toBe(false)
		})

		it('should accept usage limits', () => {
			const validData = {
				code: 'LIMITED',
				discountType: 'PERCENT',
				discountValue: 20,
				usageLimit: 100,
				perUserLimit: 1,
			}

			const result = createCouponSchema.safeParse(validData)
			expect(result.success).toBe(true)
		})

		it('should reject negative discount value', () => {
			const invalidData = {
				code: 'INVALID',
				discountType: 'PERCENT',
				discountValue: -20,
			}

			const result = createCouponSchema.safeParse(invalidData)
			expect(result.success).toBe(false)
		})
	})

	describe('updateCouponSchema', () => {
		it('should validate partial updates', () => {
			const validData = {
				discountValue: 25,
			}

			const result = updateCouponSchema.safeParse(validData)
			expect(result.success).toBe(true)
		})
	})
})

// ============================================================================
// DEAL VALIDATOR TESTS
// ============================================================================

describe('Deal Validator', () => {
	describe('createDealSchema', () => {
		it('should validate correct deal data', () => {
			const validData = {
				title: 'Family Deal',
				description: '2 Large pizzas',
				discountType: 'PERCENT',
				discountValue: 30,
				items: [
					{ productId: 'prod-1', itemType: 'PIZZA', quantity: 2 },
					{ productId: 'prod-2', itemType: 'DRINK', quantity: 2 },
				],
			}

			const result = createDealSchema.safeParse(validData)
			expect(result.success).toBe(true)
		})

		it('should validate FIXED discount type', () => {
			const validData = {
				title: 'Weekend Special',
				discountType: 'FIXED',
				discountValue: 20000,
				items: [{ productId: 'prod-1', itemType: 'PIZZA', quantity: 1 }],
			}

			const result = createDealSchema.safeParse(validData)
			expect(result.success).toBe(true)
		})

		it('should reject invalid item type', () => {
			const invalidData = {
				title: 'Deal',
				discountType: 'PERCENT',
				discountValue: 20,
				items: [{ productId: 'prod-1', itemType: 'INVALID', quantity: 1 }],
			}

			const result = createDealSchema.safeParse(invalidData)
			expect(result.success).toBe(false)
		})

		it('should reject empty items array', () => {
			const invalidData = {
				title: 'Empty Deal',
				discountType: 'PERCENT',
				discountValue: 20,
				items: [],
			}

			const result = createDealSchema.safeParse(invalidData)
			expect(result.success).toBe(false)
		})

		it('should validate date range', () => {
			const startsAt = new Date('2026-01-01')
			const endsAt = new Date('2026-01-31')

			const validData = {
				title: 'January Deal',
				discountType: 'PERCENT',
				discountValue: 15,
				startsAt,
				endsAt,
				items: [{ productId: 'prod-1', itemType: 'PIZZA', quantity: 1 }],
			}

			const result = createDealSchema.safeParse(validData)
			expect(result.success).toBe(true)
		})

		it('should reject invalid date range', () => {
			const startsAt = new Date('2026-01-31')
			const endsAt = new Date('2026-01-01')

			const invalidData = {
				title: 'Invalid Deal',
				discountType: 'PERCENT',
				discountValue: 15,
				startsAt,
				endsAt,
				items: [{ productId: 'prod-1', itemType: 'PIZZA', quantity: 1 }],
			}

			const result = createDealSchema.safeParse(invalidData)
			expect(result.success).toBe(false)
		})

		it('should accept multiple item types', () => {
			const validData = {
				title: 'Combo Deal',
				discountType: 'PERCENT',
				discountValue: 25,
				items: [
					{ productId: 'prod-1', itemType: 'PIZZA', quantity: 1 },
					{ productId: 'prod-2', itemType: 'SIDE', quantity: 1 },
					{ productId: 'prod-3', itemType: 'DRINK', quantity: 2 },
				],
			}

			const result = createDealSchema.safeParse(validData)
			expect(result.success).toBe(true)
		})

		it('should reject zero or negative quantity', () => {
			const invalidData = {
				title: 'Invalid Deal',
				discountType: 'PERCENT',
				discountValue: 20,
				items: [{ productId: 'prod-1', itemType: 'PIZZA', quantity: 0 }],
			}

			const result = createDealSchema.safeParse(invalidData)
			expect(result.success).toBe(false)
		})

		it('should validate imageUrl if provided', () => {
			const validData = {
				title: 'Deal with Image',
				discountType: 'PERCENT',
				discountValue: 20,
				imageUrl: 'https://example.com/deal.jpg',
				items: [{ productId: 'prod-1', itemType: 'PIZZA', quantity: 1 }],
			}

			const result = createDealSchema.safeParse(validData)
			expect(result.success).toBe(true)
		})

		it('should reject invalid imageUrl', () => {
			const invalidData = {
				title: 'Deal',
				discountType: 'PERCENT',
				discountValue: 20,
				imageUrl: 'not-a-url',
				items: [{ productId: 'prod-1', itemType: 'PIZZA', quantity: 1 }],
			}

			const result = createDealSchema.safeParse(invalidData)
			expect(result.success).toBe(false)
		})
	})

	describe('updateDealSchema', () => {
		it('should validate partial updates', () => {
			const validData = {
				title: 'Updated Deal Title',
			}

			const result = updateDealSchema.safeParse(validData)
			expect(result.success).toBe(true)
		})
	})
})
