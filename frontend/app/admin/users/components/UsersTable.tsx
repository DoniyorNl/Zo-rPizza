// =====================================
// 📁 FILE PATH: frontend/src/app/admin/users/components/UsersTable.tsx
// 🎯 PURPOSE: Main users table with header and rows
// 📝 UPDATED: 2025-01-11
// =====================================

import React from 'react'
import { UserData } from '../types/user.types'
import { UsersTableRow } from './UsersTableRow'
import { UsersEmptyState } from './UsersEmptyState'
import { UsersPagination } from './UsersPagination'

interface UsersTableProps {
	users: UserData[]
	loading: boolean
	error: string | null
	currentPage: number
	totalPages: number
	onPageChange: (page: number) => void
	onRoleChange: (userId: string, newRole: string) => void
	onBlockToggle: (userId: string, currentStatus: boolean) => void
}

export const UsersTable: React.FC<UsersTableProps> = ({
	users,
	loading,
	error,
	currentPage,
	totalPages,
	onPageChange,
	onRoleChange,
	onBlockToggle,
}) => {
	const isEmpty = !loading && !error && users.length === 0

	return (
		<div className='bg-white rounded-xl shadow-sm overflow-hidden'>
			{/* Empty States */}
			{(loading || error || isEmpty) && (
				<UsersEmptyState loading={loading} error={error} isEmpty={isEmpty} />
			)}

			{/* Table Content */}
			{!loading && !error && users.length > 0 && (
				<>
					<div className='overflow-x-auto'>
						<table className='w-full'>
							{/* Table Header */}
							<thead className='bg-gray-50 border-b border-gray-200'>
								<tr>
									<th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
										Foydalanuvchi
									</th>
									<th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
										Email
									</th>
									<th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
										Rol
									</th>
									<th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
										Buyurtmalar
									</th>
									<th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
										Ro'yxatdan o'tgan
									</th>
									<th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
										Status
									</th>
									<th className='px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider'>
										Amallar
									</th>
								</tr>
							</thead>

							{/* Table Body */}
							<tbody className='divide-y divide-gray-200'>
								{users.map(user => (
									<UsersTableRow
										key={user.id}
										user={user}
										onRoleChange={onRoleChange}
										onBlockToggle={onBlockToggle}
									/>
								))}
							</tbody>
						</table>
					</div>

					{/* Pagination */}
					<UsersPagination
						currentPage={currentPage}
						totalPages={totalPages}
						onPageChange={onPageChange}
					/>
				</>
			)}
		</div>
	)
}
