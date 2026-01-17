// frontend/app/admin/dashboard/components/AlertsPanel.tsx

'use client'

import React from 'react'
import Link from 'next/link'
import { DashboardAlert } from '../types/dashboard.types'
import { getAlertSeverityColor, getAlertIcon, timeAgo } from '../utils/dashboardHelpers'

interface AlertsPanelProps {
	alerts: DashboardAlert[]
	unreadCount: number
	onMarkAsRead: (alertId: string) => void
	onMarkAllAsRead: () => void
	onDismiss: (alertId: string) => void
	onClearAll: () => void
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({
	alerts,
	unreadCount,
	onMarkAsRead,
	onMarkAllAsRead,
	onDismiss,
	onClearAll,
}) => {
	if (alerts.length === 0) {
		return (
			<div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
				<div className='flex items-center justify-between mb-4'>
					<h3 className='text-lg font-semibold text-gray-900'>🔔 Ogohlantirishlar</h3>
				</div>
				<div className='text-center py-8'>
					<div className='text-gray-400 text-5xl mb-3'>📭</div>
					<p className='text-gray-500'>Hozircha ogohlantirishlar yo'q</p>
				</div>
			</div>
		)
	}

	return (
		<div className='bg-white rounded-lg shadow-sm border border-gray-200'>
			{/* Header */}
			<div className='flex items-center justify-between p-4 border-b border-gray-200'>
				<div className='flex items-center space-x-3'>
					<h3 className='text-lg font-semibold text-gray-900'>🔔 Ogohlantirishlar</h3>
					{unreadCount > 0 && (
						<span className='px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full'>
							{unreadCount}
						</span>
					)}
				</div>

				<div className='flex items-center space-x-2'>
					{unreadCount > 0 && (
						<button
							onClick={onMarkAllAsRead}
							className='text-sm text-blue-600 hover:text-blue-700 font-medium'
						>
							Barchasini o'qilgan qilish
						</button>
					)}
					{alerts.length > 0 && (
						<button
							onClick={onClearAll}
							className='text-sm text-red-600 hover:text-red-700 font-medium'
						>
							Hammasini tozalash
						</button>
					)}
				</div>
			</div>

			{/* Alerts List */}
			<div className='divide-y divide-gray-200 max-h-96 overflow-y-auto'>
				{alerts.map(alert => (
					<div
						key={alert.id}
						className={`p-4 hover:bg-gray-50 transition-colors ${
							!alert.isRead ? 'bg-blue-50' : ''
						}`}
						onClick={() => !alert.isRead && onMarkAsRead(alert.id)}
					>
						<div className='flex items-start justify-between'>
							{/* Alert Content */}
							<div className='flex items-start space-x-3 flex-1'>
								{/* Icon */}
								<div className='flex-shrink-0 text-2xl'>{getAlertIcon(alert.type)}</div>

								{/* Text Content */}
								<div className='flex-1 min-w-0'>
									<div className='flex items-center space-x-2 mb-1'>
										<h4 className='text-sm font-semibold text-gray-900'>{alert.title}</h4>
										<span
											className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getAlertSeverityColor(
												alert.severity,
											)}`}
										>
											{alert.severity === 'critical' && 'Muhim'}
											{alert.severity === 'warning' && 'Ogohlantirish'}
											{alert.severity === 'info' && "Ma'lumot"}
											{alert.severity === 'success' && 'Muvaffaqiyat'}
										</span>
									</div>

									<p className='text-sm text-gray-600 mb-2'>{alert.message}</p>

									<div className='flex items-center space-x-4 text-xs text-gray-500'>
										<span>{timeAgo(alert.timestamp)}</span>
										{alert.actionUrl && (
											<Link
												href={alert.actionUrl}
												className='text-blue-600 hover:text-blue-700 font-medium'
												onClick={e => e.stopPropagation()}
											>
												Ko'rish →
											</Link>
										)}
									</div>
								</div>
							</div>

							{/* Dismiss Button */}
							<button
								onClick={e => {
									e.stopPropagation()
									onDismiss(alert.id)
								}}
								className='flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600'
							>
								<svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M6 18L18 6M6 6l12 12'
									/>
								</svg>
							</button>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
