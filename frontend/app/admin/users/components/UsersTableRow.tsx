// =====================================
// 📁 FILE PATH: frontend/src/app/admin/users/components/UsersTableRow.tsx
// 🎯 PURPOSE: Single user row with actions (role change, block/unblock)
// 📝 UPDATED: 2025-01-11
// =====================================

import { Ban, CheckCircle, Shield } from 'lucide-react'
import React from 'react'
import { UserData } from '../types/user.types'
import {
	formatDateShort,
	getBlockButtonTitle,
	getRoleBadgeColor,
	getRoleLabel,
	getUserInitials,
} from '../utils/userHelpers'

interface UsersTableRowProps {
	user: UserData
	onRoleChange: (userId: string, newRole: string) => void
	onBlockToggle: (userId: string, currentStatus: boolean) => void
	onDriverToggle?: (userId: string, currentStatus: boolean) => void
}

export const UsersTableRow: React.FC<UsersTableRowProps> = ({
	user,
	onRoleChange,
	onBlockToggle,
	onDriverToggle,
}) => {
	return (
		<tr className='hover:bg-gray-50/80 transition-colors'>
			{/* User Info */}
			<td className='px-1.5 py-1'>
				<div className='flex items-center gap-1.5 min-w-0'>
					<div className='flex-shrink-0 h-6 w-6 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold text-[10px]'>
						{getUserInitials(user.name)}
					</div>
					<div className='min-w-0'>
						<div className='text-[11px] font-medium text-gray-900 truncate leading-tight'>
							{user.name || 'Ism kiritilmagan'}
						</div>
						{user.phone && <div className='text-[10px] text-gray-500 truncate leading-tight'>{user.phone}</div>}
					</div>
				</div>
			</td>

			{/* Email */}
			<td className='px-1.5 py-1 max-w-[140px]'>
				<div className='text-[11px] text-gray-900 truncate' title={user.email}>{user.email}</div>
			</td>

			{/* Role Badge */}
			<td className='px-1.5 py-1'>
				<span
					className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium border ${getRoleBadgeColor(
						user.role,
					)}`}
				>
					<Shield className='w-2.5 h-2.5 flex-shrink-0' />
					<span>{getRoleLabel(user.role)}</span>
				</span>
			</td>

			{/* Driver */}
			<td className='px-1.5 py-1 text-center'>
				{onDriverToggle ? (
					<button
						onClick={() => onDriverToggle(user.id, user.isDriver || false)}
						className={`inline-flex items-center justify-center min-w-[1.75rem] h-5 rounded text-[10px] font-medium border transition-colors ${user.isDriver
							? 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200'
							: 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
							}`}
						title={user.isDriver ? 'Haydovchi - bosish orqali o\'chirish' : 'Haydovchi qilish'}
					>
						{user.isDriver ? 'Ha' : 'Yo\'q'}
					</button>
				) : (
					<span className='text-[11px] text-gray-500'>{user.isDriver ? 'Ha' : 'Yo\'q'}</span>
				)}
			</td>

			{/* Orders */}
			<td className='px-1.5 py-1 text-center'>
				<span className='text-[11px] text-gray-900'>{user._count?.orders ?? 0} ta</span>
			</td>

			{/* Created Date */}
			<td className='px-1.5 py-1'>
				<div className='text-[11px] text-gray-900'>{formatDateShort(user.createdAt)}</div>
			</td>

			{/* Status */}
			<td className='px-1.5 py-1'>
				{user.isBlocked ? (
					<span className='inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-100 text-red-800 border border-red-200'>
						<Ban className='w-2.5 h-2.5 flex-shrink-0' />
						Bloklangan
					</span>
				) : (
					<span className='inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-800 border border-green-200'>
						<CheckCircle className='w-2.5 h-2.5 flex-shrink-0' />
						Faol
					</span>
				)}
			</td>

			{/* Actions */}
			<td className='px-1.5 py-1 text-right'>
				<div className='flex items-center justify-end gap-1'>
					<select
						value={['CUSTOMER', 'ADMIN', 'DELIVERY'].includes(user.role) ? user.role : 'CUSTOMER'}
						onChange={e => onRoleChange(user.id, e.target.value)}
						className='text-[11px] border border-gray-200 rounded px-1.5 py-0.5 focus:ring-1 focus:ring-orange-500 focus:border-transparent cursor-pointer hover:border-gray-300'
					>
						<option value='CUSTOMER'>Mijoz</option>
						<option value='ADMIN'>Admin</option>
						<option value='DELIVERY'>Yetkazuvchi</option>
					</select>
					<button
						onClick={() => onBlockToggle(user.id, user.isBlocked || false)}
						className={`p-1 rounded transition-colors ${user.isBlocked
							? 'bg-green-100 text-green-700 hover:bg-green-200'
							: 'bg-red-100 text-red-700 hover:bg-red-200'
							}`}
						title={getBlockButtonTitle(user.isBlocked)}
					>
						{user.isBlocked ? <CheckCircle className='w-3 h-3' /> : <Ban className='w-3 h-3' />}
					</button>
				</div>
			</td>
		</tr>
	)
}
