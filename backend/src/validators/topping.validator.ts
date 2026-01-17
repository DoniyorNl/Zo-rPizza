// backend/src/validators/topping.validator.ts
// ✅ Topping validation schemas

import { z } from 'zod'

const baseToppingSchema = z.object({
	name: z.string().trim().min(1),
	price: z.coerce.number().nonnegative(),
	isActive: z.coerce.boolean().optional(),
})

export const createToppingSchema = baseToppingSchema
export const updateToppingSchema = baseToppingSchema.partial()
