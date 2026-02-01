// =====================================
// 📁 FILE PATH: frontend/src/app/admin/users/utils/userConstants.ts
// 🎯 PURPOSE: Constants for User Management
// 📝 Backend bilan bir xil qiymatlar (single source of truth)
// =====================================

export const ITEMS_PER_PAGE = 10

/** API ga yuboriladigan rol qiymatlari - faqat shular */
export const API_ROLES = ['CUSTOMER', 'ADMIN', 'DELIVERY'] as const
export type ApiRole = (typeof API_ROLES)[number]

export const USER_ROLES = {
	CUSTOMER: 'CUSTOMER',
	ADMIN: 'ADMIN',
	DELIVERY: 'DELIVERY',
	ALL: 'ALL',
} as const

/** Dropdown value -> API value. Doim to'g'ri format yuborish uchun */
export function toApiRole(value: string): ApiRole {
	const v = value?.trim().toUpperCase()
	if (API_ROLES.includes(v as ApiRole)) return v as ApiRole
	const labelMap: Record<string, ApiRole> = {
		MIJOZ: 'CUSTOMER',
		ADMIN: 'ADMIN',
		YETKAZUVCHI: 'DELIVERY',
	}
	return labelMap[v] ?? 'CUSTOMER'
}

export const ROLE_LABELS = {
	CUSTOMER: 'Mijoz',
	ADMIN: 'Admin',
	DELIVERY: 'Yetkazuvchi',
	ALL: 'Barcha rollar',
} as const

export const ROLE_BADGE_COLORS = {
	ADMIN: 'bg-purple-100 text-purple-800 border-purple-200',
	DELIVERY: 'bg-blue-100 text-blue-800 border-blue-200',
	CUSTOMER: 'bg-gray-100 text-gray-800 border-gray-200',
} as const

export const STATUS_COLORS = {
	BLOCKED: 'bg-red-100 text-red-800 border-red-200',
	ACTIVE: 'bg-green-100 text-green-800 border-green-200',
} as const