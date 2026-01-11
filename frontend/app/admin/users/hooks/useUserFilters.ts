// =====================================
// 📁 FILE PATH: frontend/src/app/admin/users/hooks/useUserFilters.ts
// 🎯 PURPOSE: Custom hook for user filtering and search
// 📝 UPDATED: 2025-01-11
// =====================================

import { useState, useMemo } from 'react'
import { UserData, UserRole } from '../types/user.types'

interface UseUserFiltersReturn {
	searchTerm: string
	setSearchTerm: (term: string) => void
	roleFilter: UserRole
	setRoleFilter: (role: UserRole) => void
	currentPage: number
	setCurrentPage: (page: number) => void
	filteredUsers: UserData[]
}

export const useUserFilters = (users: UserData[]): UseUserFiltersReturn => {
	const [searchTerm, setSearchTerm] = useState('')
	const [roleFilter, setRoleFilter] = useState<UserRole>('ALL')
	const [currentPage, setCurrentPage] = useState(1)

	/**
	 * Filter users based on search term
	 * Note: This is client-side filtering for real-time UX
	 * Backend already handles filtering via API
	 */
	const filteredUsers = useMemo(() => {
		if (!searchTerm) return users

		const term = searchTerm.toLowerCase()
		return users.filter(
			user =>
				user.name?.toLowerCase().includes(term) ||
				user.email.toLowerCase().includes(term) ||
				user.phone?.includes(term),
		)
	}, [users, searchTerm])

	return {
		searchTerm,
		setSearchTerm,
		roleFilter,
		setRoleFilter,
		currentPage,
		setCurrentPage,
		filteredUsers,
	}
}
