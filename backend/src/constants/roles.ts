/**
 * User role constants - single source of truth
 * Frontend va Backend bir xil qiymatlardan foydalanishi kerak
 */

export const VALID_ROLES = ['CUSTOMER', 'ADMIN', 'DELIVERY'] as const
export type ApiRole = (typeof VALID_ROLES)[number]

/** O'zbek label -> API value mapping */
export const ROLE_LABEL_TO_API: Record<string, ApiRole> = {
	MIJOZ: 'CUSTOMER',
	ADMIN: 'ADMIN',
	YETKAZUVCHI: 'DELIVERY',
	CUSTOMER: 'CUSTOMER',
	DELIVERY: 'DELIVERY',
}

export function isValidRole(value: unknown): value is ApiRole {
	return typeof value === 'string' && VALID_ROLES.includes(value as ApiRole)
}
