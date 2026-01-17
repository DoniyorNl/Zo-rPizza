// backend/src/validators/deal.validator.ts
// ✅ Deal validation schemas

import { z } from 'zod'

const discountTypes = ['PERCENT', 'FIXED'] as const
const dealItemTypes = ['PIZZA', 'DRINK', 'SIDE'] as const

const dealItemSchema = z.object({
	productId: z.string().trim().min(1),
	itemType: z.enum(dealItemTypes),
	quantity: z.coerce.number().int().positive(),
})

const baseDealSchema = z.object({
	title: z.string().trim().min(1),
	description: z.string().optional(),
	imageUrl: z.string().url().optional().nullable(),
	discountType: z.enum(discountTypes),
	discountValue: z.coerce.number().positive(),
	isActive: z.coerce.boolean().optional(),
	startsAt: z.coerce.date().optional(),
	endsAt: z.coerce.date().optional(),
	items: z.array(dealItemSchema).min(1),
})

export const createDealSchema = baseDealSchema.refine(
	data => (data.endsAt ? data.startsAt && data.startsAt <= data.endsAt : true),
	{ message: 'Invalid date range', path: ['endsAt'] },
)

export const updateDealSchema = baseDealSchema.partial().refine(
	data => (data.endsAt ? data.startsAt && data.startsAt <= data.endsAt : true),
	{ message: 'Invalid date range', path: ['endsAt'] },
)
