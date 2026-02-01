// =====================================
// 📁 FILE PATH: frontend/src/app/admin/users/components/UsersFilters.tsx
// 🎯 PURPOSE: Search and role filter controls
// 📝 UPDATED: 2025-01-11
// =====================================

import { Filter, Search } from 'lucide-react'
import React from 'react'
import { UserRole, UserStatistics } from '../types/user.types'
import { ROLE_LABELS } from '../utils/userConstants'
import { UsersStats } from './UsersStats'

interface UsersFiltersProps {
	searchTerm: string
	onSearchChange: (term: string) => void
	roleFilter: UserRole
	onRoleFilterChange: (role: UserRole) => void
	statistics: UserStatistics
}

export const UsersFilters: React.FC<UsersFiltersProps> = ({
	searchTerm,
	onSearchChange,
	roleFilter,
	onRoleFilterChange,
	statistics,
}) => {
	return (
		<div className='bg-white rounded-xl shadow-sm p-3 mb-3'>
			<div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
				{/* Search Input */}
				<div className='relative'>
					<Search className='absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
					<input
						type='text'
						placeholder="Ism yoki email bo'yicha qidirish..."
						value={searchTerm}
						onChange={e => onSearchChange(e.target.value)}
						className='w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all'
					/>
				</div>

				{/* Role Filter */}
				<div className='relative'>
					<Filter className='absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
					<select
						value={roleFilter}
						onChange={e => onRoleFilterChange(e.target.value as UserRole)}
						className='w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none cursor-pointer transition-all'
					>
						<option value='ALL'>{ROLE_LABELS.ALL}</option>
						<option value='CUSTOMER'>{ROLE_LABELS.CUSTOMER}</option>
						<option value='ADMIN'>{ROLE_LABELS.ADMIN}</option>
						<option value='DELIVERY'>{ROLE_LABELS.DELIVERY}</option>
					</select>
				</div>
			</div>

			{/* Statistics */}
			<UsersStats statistics={statistics} />
		</div>
	)
}
