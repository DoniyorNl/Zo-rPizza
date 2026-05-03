// =====================================
// 📁 FILE PATH: frontend/src/app/admin/users/hooks/useUsers.ts
// 🎯 PURPOSE: Custom hook for fetching and managing users data
// 📝 UPDATED: 2025-01-11 - FIXED
// =====================================

import { api } from '@/lib/apiClient'
import { useEffect, useState } from 'react'
import { UserData, UserStatistics } from '../types/user.types'
import { ITEMS_PER_PAGE } from '../utils/userConstants'

interface UseUsersParams {
	currentPage: number
	roleFilter: string
	searchTerm: string
}

interface UseUsersReturn {
	users: UserData[]
	loading: boolean
	error: string | null
	totalPages: number
	statistics: UserStatistics
	refetch: () => void
}

export const useUsers = ({
	currentPage,
	roleFilter,
	searchTerm,
}: UseUsersParams): UseUsersReturn => {
	const [users, setUsers] = useState<UserData[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [totalPages, setTotalPages] = useState(1)
	const [statistics, setStatistics] = useState<UserStatistics>({
		totalCustomers: 0,
		totalAdmins: 0,
		totalDelivery: 0,
	})

	const fetchUsers = async () => {
		try {
			setLoading(true)
			setError(null)

		const queryParams = new URLSearchParams({
			page: currentPage.toString(),
			limit: ITEMS_PER_PAGE.toString(),
			...(roleFilter !== 'ALL' && { role: roleFilter }),
			...(searchTerm && { search: searchTerm }),
		})

		const response = await api.get(`/api/users?${queryParams}`)
		const data = response.data

		if (data.success) {
				setUsers(data.data.users || [])
				setTotalPages(data.data.pagination?.totalPages || 1)

				// Statistics from backend (darhol to'g'ri)
				const stats = data.data.statistics
				if (stats) {
					setStatistics({
						totalCustomers: stats.totalCustomers ?? 0,
						totalAdmins: stats.totalAdmins ?? 0,
						totalDelivery: stats.totalDelivery ?? 0,
					})
				} else {
					const allUsers = data.data.users || []
					setStatistics({
						totalCustomers: allUsers.filter((u: UserData) => u.role === 'CUSTOMER').length,
						totalAdmins: allUsers.filter((u: UserData) => u.role === 'ADMIN').length,
						totalDelivery: allUsers.filter((u: UserData) => u.isDriver === true).length,
					})
				}

				console.log('✅ Users loaded:', data.data.users?.length)
			} else {
				throw new Error(data.message || 'Failed to fetch users')
			}
		} catch (err) {
			console.error('❌ Error fetching users:', err)
			setError(err instanceof Error ? err.message : 'Unknown error')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchUsers()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentPage, roleFilter, searchTerm])

	return {
		users,
		loading,
		error,
		totalPages,
		statistics,
		refetch: fetchUsers,
	}
}
