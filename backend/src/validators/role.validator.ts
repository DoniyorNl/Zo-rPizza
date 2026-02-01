/**
 * Role validation - robust parsing, Unicode/BOM/whitespace handling
 */

import { UserRole } from '@prisma/client'
import { ROLE_LABEL_TO_API, VALID_ROLES, type ApiRole } from '../constants/roles'

/** Prisma enum dan to'g'ridan-to'g'ri qiymat (runtime validation uchun) */
const ROLE_TO_PRISMA: Record<ApiRole, UserRole> = {
	CUSTOMER: UserRole.CUSTOMER,
	ADMIN: UserRole.ADMIN,
	DELIVERY: UserRole.DELIVERY,
}

/** Remove BOM, zero-width chars, trim */
function sanitize(str: string): string {
	return str.replace(/[\uFEFF\u200B-\u200D\u2060]/g, '').trim()
}

/**
 * Parse and validate role from request body.
 * Qabul qiladi: CUSTOMER, ADMIN, DELIVERY yoki Mijoz, Admin, Yetkazuvchi
 */
export function parseRole(input: unknown): { success: true; role: ApiRole; prismaRole: UserRole } | { success: false; error: string } {
	if (input === null || input === undefined) {
		return { success: false, error: 'Role is required' }
	}

	const raw = typeof input === 'string' ? input : String(input)
	const cleaned = sanitize(raw).toUpperCase()

	if (!cleaned) {
		return { success: false, error: 'Role is required' }
	}

	// Direct match yoki label orqali
	const role = ROLE_LABEL_TO_API[cleaned] ?? (VALID_ROLES.includes(cleaned as ApiRole) ? (cleaned as ApiRole) : null)

	if (!role || !VALID_ROLES.includes(role)) {
		return { success: false, error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}` }
	}

	return { success: true, role, prismaRole: ROLE_TO_PRISMA[role] }
}
