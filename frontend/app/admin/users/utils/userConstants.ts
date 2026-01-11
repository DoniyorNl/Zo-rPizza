// =====================================
// 📁 FILE PATH: frontend/src/app/admin/users/utils/userConstants.ts
// 🎯 PURPOSE: Constants for User Management
// 📝 UPDATED: 2025-01-11
// =====================================

export const ITEMS_PER_PAGE = 10

export const USER_ROLES = {
	CUSTOMER: 'CUSTOMER',
	ADMIN: 'ADMIN',
	DELIVERY: 'DELIVERY',
	ALL: 'ALL',
} as const

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