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
		<div className='grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200'>
			{stats.map(stat => (
				<div key={stat.label} className='text-center'>
					<p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
					<p className='text-sm text-gray-600 mt-1'>{stat.label}</p>
				</div>
			))}
		</div>
	)
}
