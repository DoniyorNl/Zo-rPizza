// =====================================
// 📁 FILE PATH: frontend/src/app/admin/users/components/UsersStats.tsx
// 🎯 PURPOSE: User statistics cards (Customers, Admins, Delivery)
// 📝 UPDATED: 2025-01-11
// =====================================

import React from 'react'
import { UserStatistics } from '../types/user.types'

interface UsersStatsProps {
	statistics: UserStatistics
}

export const UsersStats: React.FC<UsersStatsProps> = ({ statistics }) => {
	const stats = [
		{
			label: 'Mijozlar',
			value: statistics.totalCustomers,
			color: 'text-blue-600',
		},
		{
			label: 'Adminlar',
			value: statistics.totalAdmins,
			color: 'text-purple-600',
		},
		{
			label: 'Yetkazuvchilar',
			value: statistics.totalDelivery,
			color: 'text-green-600',
		},
	]

	return (
		<div className='grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-200'>
			{stats.map(stat => (
				<div key={stat.label} className='text-center'>
					<p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
					<p className='text-[10px] text-gray-600 mt-0 leading-tight'>{stat.label}</p>
				</div>
			))}
		</div>
	)
}
