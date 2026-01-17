// backend/src/validators/coupon.validator.ts
// ✅ Coupon validation schemas

import { z } from 'zod'

const discountTypes = ['PERCENT', 'FIXED'] as const

const baseCouponSchema = z.object({
	code: z.string().trim().min(3),
	description: z.string().optional(),
	discountType: z.enum(discountTypes),
	discountValue: z.coerce.number().positive(),
	isActive: z.coerce.boolean().optional(),
	startsAt: z.coerce.date().optional(),
	endsAt: z.coerce.date().optional(),
	usageLimit: z.coerce.number().int().positive().optional(),
	perUserLimit: z.coerce.number().int().positive().optional(),
})

export const createCouponSchema = baseCouponSchema.refine(
	data => (data.endsAt ? data.startsAt && data.startsAt <= data.endsAt : true),
	{ message: 'Invalid date range', path: ['endsAt'] },
)

export const updateCouponSchema = baseCouponSchema.partial().refine(
	data => (data.endsAt ? data.startsAt && data.startsAt <= data.endsAt : true),
	{ message: 'Invalid date range', path: ['endsAt'] },
)
