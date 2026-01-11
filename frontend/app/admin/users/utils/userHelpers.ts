// =====================================
// 📁 FILE PATH: frontend/src/app/admin/users/utils/userHelpers.ts
// 🎯 PURPOSE: Helper functions for User Management
// 📝 UPDATED: 2025-01-11
// =====================================

import { ROLE_LABELS, ROLE_BADGE_COLORS } from './userConstants'

/**
 * Get role badge color classes
 */
export const getRoleBadgeColor = (role: string): string => {
	switch (role) {
		case 'ADMIN':
			return ROLE_BADGE_COLORS.ADMIN
		case 'DELIVERY':
			return ROLE_BADGE_COLORS.DELIVERY
		default:
			return ROLE_BADGE_COLORS.CUSTOMER
	}
}

/**
 * Get role label in Uzbek
 */
export const getRoleLabel = (role: string): string => {
	switch (role) {
		case 'ADMIN':
			return ROLE_LABELS.ADMIN
		case 'DELIVERY':
			return ROLE_LABELS.DELIVERY
		default:
			return ROLE_LABELS.CUSTOMER
	}
}

/**
 * Get user initials for avatar
 */
export const getUserInitials = (name?: string): string => {
	if (!name) return 'U'
	return name.charAt(0).toUpperCase()
}

/**
 * Format date to Uzbek locale
 */
export const formatDate = (dateString: string): string => {
	return new Date(dateString).toLocaleDateString('uz-UZ')
}

/**
 * Get status text
 */
export const getStatusText = (isBlocked?: boolean): string => {
	return isBlocked ? 'Bloklangan' : 'Faol'
}

/**
 * Get block button title
 */
export const getBlockButtonTitle = (isBlocked?: boolean): string => {
	return isBlocked ? 'Blokdan chiqarish' : 'Bloklash'
}
