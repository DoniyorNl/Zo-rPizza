// frontend/app/admin/dashboard/components/TodayRevenueChart.tsx

'use client'

import React from 'react'
import { HourlyRevenue } from '../types/dashboard.types'
import { formatCurrency, formatHour, getCurrentHour, isPeakHour } from '../utils/dashboardHelpers'

interface TodayRevenueChartProps {
	data: HourlyRevenue[]
	isLoading?: boolean
}

export const TodayRevenueChart: React.FC<TodayRevenueChartProps> = ({ data, isLoading }) => {
	if (isLoading) {
		return (
			<div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
				<h3 className='text-lg font-semibold text-gray-900 mb-4'>📊 Bugungi Soatlik Daromad</h3>
				<div className='h-80 bg-gray-100 rounded animate-pulse'></div>
			</div>
		)
	}

	const maxRevenue = data.length > 0 ? Math.max(...data.map(d => d.revenue), 1) : 1
	const currentHour = getCurrentHour()

	if (data.length === 0) {
		return (
			<div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
				<h3 className='text-lg font-semibold text-gray-900 mb-4'>📊 Bugungi Soatlik Daromad</h3>
				<p className='text-gray-500 text-center py-12'>Bugun hali ma&apos;lumot yo&apos;q</p>
			</div>
		)
	}

	return (
		<div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
			<div className='flex items-center justify-between mb-6'>
				<h3 className='text-lg font-semibold text-gray-900'>📊 Bugungi Soatlik Daromad</h3>
				<div className='flex items-center space-x-4 text-sm text-gray-500'>
					<div className='flex items-center space-x-2'>
						<div className='w-3 h-3 bg-blue-500 rounded'></div>
						<span>Daromad</span>
					</div>
					<div className='flex items-center space-x-2'>
						<div className='w-3 h-3 bg-orange-300 rounded'></div>
						<span>Eng band vaqt</span>
					</div>
				</div>
			</div>

			{/* Chart Container */}
			<div className='overflow-x-auto pb-4'>
				<div className='min-w-[800px]'>
					{/* Chart Area */}
					<div className='flex items-end justify-between space-x-0.5 h-64 mb-8'>
						{data.map(item => {
							const heightPercentage = (item.revenue / maxRevenue) * 100
							const isCurrentHour = item.hour === currentHour
							const isPeak = isPeakHour(item.hour)

							return (
								<div key={item.hour} className='flex-1 flex flex-col items-center group relative'>
									{/* Bar */}
									<div className='w-full flex flex-col items-center justify-end h-full'>
										<div
											className={`w-full rounded-t-lg transition-all duration-300 ${
												isCurrentHour
													? 'bg-green-500 shadow-lg'
													: isPeak
														? 'bg-orange-300'
														: 'bg-blue-500'
											} hover:opacity-80 cursor-pointer`}
											style={{ height: `${Math.max(heightPercentage, 2)}%` }}
										></div>
									</div>

									{/* Tooltip */}
									<div className='absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap z-10 shadow-lg'>
										<div className='font-semibold mb-1'>{formatHour(item.hour)}</div>
										<div>Daromad: {formatCurrency(item.revenue)}</div>
										<div>Buyurtmalar: {item.orders} ta</div>
										{isPeak && <div className='text-orange-300 mt-1'>🔥 Eng band vaqt</div>}
										{isCurrentHour && <div className='text-green-300 mt-1'>⏰ Hozirgi soat</div>}
										{/* Arrow */}
										<div className='absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900'></div>
									</div>
								</div>
							)
						})}
					</div>

					{/* Hour Labels (Rotated) */}
					<div className='flex items-start justify-between space-x-0.5'>
						{data.map(item => {
							const isCurrentHour = item.hour === currentHour

							return (
								<div key={`label-${item.hour}`} className='flex-1 flex justify-center'>
									<div
										className={`text-xs font-medium transform -rotate-45 origin-top-left ${
											isCurrentHour ? 'text-green-600 font-bold' : 'text-gray-600'
										}`}
										style={{ whiteSpace: 'nowrap' }}
									>
										{formatHour(item.hour)}
									</div>
								</div>
							)
						})}
					</div>
				</div>
			</div>

			{/* Summary */}
			<div className='mt-6 pt-6 border-t border-gray-200'>
				<div className='grid grid-cols-3 gap-4 text-center'>
					<div>
						<p className='text-sm text-gray-600 mb-1'>Jami Daromad</p>
						<p className='text-lg font-bold text-gray-900'>
							{formatCurrency(data.reduce((sum, item) => sum + item.revenue, 0))}
						</p>
					</div>
					<div>
						<p className='text-sm text-gray-600 mb-1'>Jami Buyurtmalar</p>
						<p className='text-lg font-bold text-gray-900'>
							{data.reduce((sum, item) => sum + item.orders, 0)} ta
						</p>
					</div>
					<div>
						<p className='text-sm text-gray-600 mb-1'>Eng Band Soat</p>
						<p className='text-lg font-bold text-gray-900'>
							{(() => {
								const peakHour = data.reduce(
									(max, item) => (item.revenue > max.revenue ? item : max),
									data[0] || { hour: 0, revenue: 0, orders: 0 },
								)
								return formatHour(peakHour.hour)
							})()}
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}
