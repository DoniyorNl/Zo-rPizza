// =====================================
// 📁 FILE PATH: frontend/src/app/admin/users/types/user.types.ts
// 🎯 PURPOSE: TypeScript interfaces for User Management
// 📝 UPDATED: 2025-01-11
// =====================================

export interface UserData {
	id: string
	name: string
	email: string
	role: 'CUSTOMER' | 'ADMIN' | 'DELIVERY'
	phone?: string
	address?: string
	createdAt: string
	updatedAt?: string
	isBlocked?: boolean
	_count?: {
		orders: number
	}
}

export interface UsersResponse {
	success: boolean
	data: {
		users: UserData[]
		pagination: {
			total: number
			page: number
			limit: number
			totalPages: number
		}
	}
}

export interface UserStatistics {
	totalCustomers: number
	totalAdmins: number
	totalDelivery: number
	totalBlocked?: number
}

export type UserRole = 'CUSTOMER' | 'ADMIN' | 'DELIVERY' | 'ALL'

export interface UserFilters {
	searchTerm: string
	roleFilter: UserRole
	currentPage: number
}
