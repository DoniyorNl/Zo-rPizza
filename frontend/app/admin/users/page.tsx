// =====================================
// 📁 FILE PATH: frontend/src/app/admin/users/page.tsx
// 🎯 PURPOSE: Main Admin Users Management page (orchestration)
// 📝 UPDATED: 2025-01-11
// 🔗 BACKEND: Railway (Production ready)
// =====================================

'use client'

import { User } from 'lucide-react'
import { UsersFilters } from './components/UsersFilters'
import { UsersTable } from './components/UsersTable'
import { useUserActions } from './hooks/useUserActions'
import { useUserFilters } from './hooks/useUserFilters'
import { useUsers } from './hooks/useUsers'

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

	// User actions (role change, block/unblock, driver toggle)
	const { updateRole, toggleBlock, toggleDriver } = useUserActions({
		onSuccess: refetch,
	})

	return (
		<div className='min-h-full bg-gray-50 p-2 sm:p-4'>
			<div className='max-w-7xl mx-auto w-full'>
				{/* Header */}
				<div className='mb-2 sm:mb-3'>
					<div className='flex items-center gap-2 mb-0.5'>
						<div className='p-1.5 bg-orange-100 rounded-lg flex-shrink-0'>
							<User className='w-4 h-4 sm:w-5 sm:h-5 text-orange-600' />
						</div>
						<h1 className='text-lg sm:text-2xl font-bold text-gray-900'>Foydalanuvchilar</h1>
					</div>
					<p className='text-xs sm:text-sm text-gray-600'>Barcha foydalanuvchilarni boshqarish va nazorat qilish</p>
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
					onDriverToggle={toggleDriver}
				/>
			</div>
		</div>
	)
}
