// =====================================
// 📁 FILE PATH: frontend/src/app/admin/users/components/UsersTable.tsx
// 🎯 PURPOSE: Main users table with header and rows
// 📝 UPDATED: 2025-01-11
// =====================================

import React from 'react'
import { UserData } from '../types/user.types'
import { UsersEmptyState } from './UsersEmptyState'
import { UsersPagination } from './UsersPagination'
import { UsersTableRow } from './UsersTableRow'

interface UsersTableProps {
	users: UserData[]
	loading: boolean
	error: string | null
	currentPage: number
	totalPages: number
	onPageChange: (page: number) => void
	onRoleChange: (userId: string, newRole: string) => void
	onBlockToggle: (userId: string, currentStatus: boolean) => void
	onDriverToggle?: (userId: string, currentStatus: boolean) => void
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
	onDriverToggle,
}) => {
	const isEmpty = !loading && !error && users.length === 0

	return (
		<div className='bg-white rounded-xl shadow-sm overflow-hidden'>
			{/* Empty States */}
			{(loading || error || isEmpty) && (
				<UsersEmptyState loading={loading} error={error} isEmpty={isEmpty} />
			)}

			{/* Table Content - ixcham, scrollsiz */}
			{!loading && !error && users.length > 0 && (
				<>
					<div className='overflow-x-auto min-w-0'>
						<table className='w-full table-auto'>
							<thead className='bg-gray-50 border-b border-gray-200'>
								<tr>
									<th className='px-1.5 py-1 text-left text-[11px] font-semibold text-gray-600 uppercase whitespace-nowrap'>
										Foydalanuvchi
									</th>
									<th className='px-1.5 py-1 text-left text-[11px] font-semibold text-gray-600 uppercase whitespace-nowrap'>
										Email
									</th>
									<th className='px-1.5 py-1 text-left text-[11px] font-semibold text-gray-600 uppercase whitespace-nowrap'>
										Rol
									</th>
									<th className='px-1.5 py-1 text-center text-[11px] font-semibold text-gray-600 uppercase whitespace-nowrap'>
										Haydovchi
									</th>
									<th className='px-1.5 py-1 text-center text-[11px] font-semibold text-gray-600 uppercase whitespace-nowrap'>
										Buyurtmalar
									</th>
									<th className='px-1.5 py-1 text-left text-[11px] font-semibold text-gray-600 uppercase whitespace-nowrap'>
										Ro&apos;yxatdan o&apos;tgan
									</th>
									<th className='px-1.5 py-1 text-left text-[11px] font-semibold text-gray-600 uppercase whitespace-nowrap'>
										Status
									</th>
									<th className='px-1.5 py-1 text-right text-[11px] font-semibold text-gray-600 uppercase whitespace-nowrap'>
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
										onDriverToggle={onDriverToggle}
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
