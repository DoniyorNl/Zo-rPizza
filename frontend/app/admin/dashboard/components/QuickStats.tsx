// frontend/app/admin/dashboard/components/QuickStats.tsx

'use client'

import React from 'react'
import { DashboardStats } from '../types/dashboard.types'
import {
	formatCurrency,
	formatPercentageChange,
	getChangeIndicator,
} from '../utils/dashboardHelpers'

interface QuickStatsProps {
	stats: DashboardStats
	isLoading?: boolean
}

export const QuickStats: React.FC<QuickStatsProps> = ({ stats, isLoading }) => {
	const statCards = [
		{
			id: 'revenue',
			title: 'Bugungi Daromad',
			value: formatCurrency(stats.todayRevenue),
			change: stats.revenueChange,
			icon: '💰',
			bgColor: 'bg-gradient-to-br from-green-50 to-green-100',
			iconBg: 'bg-green-500',
		},
		{
			id: 'orders',
			title: 'Bugungi Buyurtmalar',
			value: stats.todayOrders.toString(),
			change: stats.ordersChange,
			icon: '🛍️',
			bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
			iconBg: 'bg-blue-500',
		},
		{
			id: 'active',
			title: 'Faol Buyurtmalar',
			value: stats.activeOrders.toString(),
			change: null,
			icon: '🔥',
			bgColor: 'bg-gradient-to-br from-orange-50 to-orange-100',
			iconBg: 'bg-orange-500',
		},
		{
			id: 'average',
			title: "O'rtacha Buyurtma",
			value: formatCurrency(stats.averageOrderValue),
			change: null,
			icon: '📊',
			bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100',
			iconBg: 'bg-purple-500',
		},
	]

	if (isLoading) {
		return (
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
				{[1, 2, 3, 4].map(i => (
					<div
						key={i}
						className='bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse'
					>
						<div className='h-4 bg-gray-200 rounded w-2/3 mb-4'></div>
						<div className='h-8 bg-gray-200 rounded w-full mb-2'></div>
						<div className='h-3 bg-gray-200 rounded w-1/2'></div>
					</div>
				))}
			</div>
		)
	}

	return (
		<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
			{statCards.map(card => {
				const changeIndicator = card.change !== null ? getChangeIndicator(card.change) : null

				return (
					<div
						key={card.id}
						className={`${card.bgColor} rounded-xl shadow-sm border border-gray-200 p-6 transition-transform hover:scale-105`}
					>
						{/* Icon */}
						<div className='flex items-center justify-between mb-4'>
							<div
								className={`${card.iconBg} w-12 h-12 rounded-lg flex items-center justify-center text-2xl shadow-lg`}
							>
								{card.icon}
							</div>
							{changeIndicator && (
								<div className={`flex items-center space-x-1 ${changeIndicator.color}`}>
									<span className='text-xl'>{changeIndicator.icon}</span>
									<span className='text-sm font-bold'>{formatPercentageChange(card.change!)}</span>
								</div>
							)}
						</div>

						{/* Title */}
						<h3 className='text-sm font-medium text-gray-600 mb-2'>{card.title}</h3>

						{/* Value */}
						<p className='text-3xl font-bold text-gray-900 mb-1'>{card.value}</p>

						{/* Change Label */}
						{changeIndicator && (
							<p className={`text-xs ${changeIndicator.color} font-medium`}>
								Kechagiga nisbatan {changeIndicator.label.toLowerCase()}
							</p>
						)}
					</div>
				)
			})}
		</div>
	)
}
