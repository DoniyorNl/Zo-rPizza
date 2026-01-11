// =====================================
// 📁 FILE PATH: frontend/src/app/admin/users/components/UsersTableRow.tsx
// 🎯 PURPOSE: Single user row with actions (role change, block/unblock)
// 📝 UPDATED: 2025-01-11
// =====================================

import React from 'react'
import { Shield, Ban, CheckCircle } from 'lucide-react'
import { UserData } from '../types/user.types'
import {
	getRoleBadgeColor,
	getRoleLabel,
	getUserInitials,
	formatDate,
	getBlockButtonTitle,
} from '../utils/userHelpers'

interface UsersTableRowProps {
	user: UserData
	onRoleChange: (userId: string, newRole: string) => void
	onBlockToggle: (userId: string, currentStatus: boolean) => void
}

export const UsersTableRow: React.FC<UsersTableRowProps> = ({
	user,
	onRoleChange,
	onBlockToggle,
}) => {
	return (
		<tr className='hover:bg-gray-50 transition-colors'>
			{/* User Info */}
			<td className='px-6 py-4 whitespace-nowrap'>
				<div className='flex items-center'>
					{/* Avatar */}
					<div className='flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold text-sm'>
						{getUserInitials(user.name)}
					</div>

					{/* Name and Phone */}
					<div className='ml-4'>
						<div className='text-sm font-medium text-gray-900'>
							{user.name || 'Ism kiritilmagan'}
						</div>
						{user.phone && <div className='text-sm text-gray-500'>{user.phone}</div>}
					</div>
				</div>
			</td>

			{/* Email */}
			<td className='px-6 py-4 whitespace-nowrap'>
				<div className='text-sm text-gray-900'>{user.email}</div>
			</td>

			{/* Role Badge */}
			<td className='px-6 py-4 whitespace-nowrap'>
				<span
					className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(
						user.role,
					)}`}
				>
					<Shield className='w-3 h-3' />
					{getRoleLabel(user.role)}
				</span>
			</td>

			{/* Orders Count */}
			<td className='px-6 py-4 whitespace-nowrap'>
				<div className='text-sm text-gray-900'>{user._count?.orders || 0} ta</div>
			</td>

			{/* Created Date */}
			<td className='px-6 py-4 whitespace-nowrap'>
				<div className='text-sm text-gray-900'>{formatDate(user.createdAt)}</div>
			</td>

			{/* Status Badge */}
			<td className='px-6 py-4 whitespace-nowrap'>
				{user.isBlocked ? (
					<span className='inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200'>
						<Ban className='w-3 h-3' />
						Bloklangan
					</span>
				) : (
					<span className='inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200'>
						<CheckCircle className='w-3 h-3' />
						Faol
					</span>
				)}
			</td>

			{/* Actions */}
			<td className='px-6 py-4 whitespace-nowrap text-right'>
				<div className='flex items-center justify-end gap-2'>
					{/* Role Change Dropdown */}
					<select
						value={user.role}
						onChange={e => onRoleChange(user.id, e.target.value)}
						className='text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-orange-500 focus:border-transparent cursor-pointer hover:border-gray-300 transition-colors'
					>
						<option value='CUSTOMER'>Mijoz</option>
						<option value='ADMIN'>Admin</option>
						<option value='DELIVERY'>Yetkazuvchi</option>
					</select>

					{/* Block/Unblock Button */}
					<button
						onClick={() => onBlockToggle(user.id, user.isBlocked || false)}
						className={`p-2 rounded-lg transition-colors ${
							user.isBlocked
								? 'bg-green-100 text-green-700 hover:bg-green-200'
								: 'bg-red-100 text-red-700 hover:bg-red-200'
						}`}
						title={getBlockButtonTitle(user.isBlocked)}
					>
						{user.isBlocked ? <CheckCircle className='w-4 h-4' /> : <Ban className='w-4 h-4' />}
					</button>
				</div>
			</td>
		</tr>
	)
}
