// =====================================
// 📁 FILE PATH: frontend/src/app/admin/users/page.tsx
// 🎯 PURPOSE: Main Admin Users Management page (orchestration)
// 📝 UPDATED: 2025-01-11
// 🔗 BACKEND: Railway (Production ready)
// =====================================

'use client'

import React from 'react'
import { User } from 'lucide-react'
import { useUsers } from './hooks/useUsers'
import { useUserActions } from './hooks/useUserActions'
import { useUserFilters } from './hooks/useUserFilters'
import { UsersFilters } from './components/UsersFilters'
import { UsersTable } from './components/UsersTable'

export default function AdminUsersPage() {
	// Filter state and logic
	const { searchTerm, setSearchTerm, roleFilter, setRoleFilter, currentPage, setCurrentPage } =
		useUserFilters([])

	// Fetch users data
	const { users, loading, error, totalPages, statistics, refetch } = useUsers({
		currentPage,
		roleFilter,
		searchTerm,
	})

	// User actions (role change, block/unblock)
	const { updateRole, toggleBlock } = useUserActions({
		onSuccess: refetch,
	})

	return (
		<div className='min-h-screen bg-gray-50 p-6'>
			<div className='max-w-7xl mx-auto'>
				{/* Header */}
				<div className='mb-8'>
					<div className='flex items-center gap-3 mb-2'>
						<div className='p-2 bg-orange-100 rounded-lg'>
							<User className='w-6 h-6 text-orange-600' />
						</div>
						<h1 className='text-3xl font-bold text-gray-900'>Foydalanuvchilar</h1>
					</div>
					<p className='text-gray-600'>Barcha foydalanuvchilarni boshqarish va nazorat qilish</p>
				</div>

				{/* Filters and Search */}
				<UsersFilters
					searchTerm={searchTerm}
					onSearchChange={setSearchTerm}
					roleFilter={roleFilter}
					onRoleFilterChange={setRoleFilter}
					statistics={statistics}
				/>

				{/* Users Table */}
				<UsersTable
					users={users}
					loading={loading}
					error={error}
					currentPage={currentPage}
					totalPages={totalPages}
					onPageChange={setCurrentPage}
					onRoleChange={updateRole}
					onBlockToggle={toggleBlock}
				/>
			</div>
		</div>
	)
}
