// backend/src/validators/product.validator.ts
// ✅ Product validation schemas (create/update)

import { z } from 'zod'

const sizeOptions = ['Small', 'Medium', 'Large', 'XL'] as const

const variationSchema = z.object({
	size: z.enum(sizeOptions),
	price: z.coerce.number().positive(),
	diameter: z.coerce.number().int().positive().optional().nullable(),
	slices: z.coerce.number().int().positive().optional().nullable(),
	weight: z.coerce.number().int().positive().optional().nullable(),
})

const baseProductSchema = z.object({
	name: z.string().trim().min(1),
	description: z.string().trim().min(1),
	basePrice: z.coerce.number().positive(),
	imageUrl: z.string().url().optional().nullable(),
	prepTime: z.coerce.number().int().positive(),
	categoryId: z.string().trim().min(1),
	isActive: z.coerce.boolean().optional(),
	variations: z.array(variationSchema).optional(),
	ingredients: z.any().optional(),
	recipe: z.string().optional(),
	cookingTemp: z.coerce.number().int().positive().optional(),
	cookingTime: z.coerce.number().int().positive().optional(),
	cookingSteps: z.any().optional(),
	calories: z.coerce.number().int().positive().optional(),
	protein: z.coerce.number().positive().optional(),
	carbs: z.coerce.number().positive().optional(),
	fat: z.coerce.number().positive().optional(),
	difficulty: z.string().optional(),
	servings: z.coerce.number().int().positive().optional(),
	allergens: z.array(z.string()).optional(),
	images: z.array(z.string()).optional(),
})

export const createProductSchema = baseProductSchema.superRefine((data, ctx) => {
	if (data.variations && data.variations.length > 0) {
		const sizes = data.variations.map(variation => variation.size)
		const uniqueSizes = new Set(sizes)
		if (uniqueSizes.size !== sizes.length) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Duplicate variation sizes are not allowed',
				path: ['variations'],
			})
		}
	}
})

export const updateProductSchema = baseProductSchema.partial().superRefine((data, ctx) => {
	if (data.variations && data.variations.length > 0) {
		const sizes = data.variations.map(variation => variation.size)
		const uniqueSizes = new Set(sizes)
		if (uniqueSizes.size !== sizes.length) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Duplicate variation sizes are not allowed',
				path: ['variations'],
			})
		}
	}
})
