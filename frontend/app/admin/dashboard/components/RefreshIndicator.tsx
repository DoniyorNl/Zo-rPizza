// frontend/app/admin/dashboard/components/RefreshIndicator.tsx

'use client'

import React from 'react'

interface RefreshIndicatorProps {
	isLive: boolean
	isRefreshing: boolean
	secondsUntilRefresh: number
	onToggleLive: () => void
	onForceRefresh: () => void
	lastUpdated: string | null
}

export const RefreshIndicator: React.FC<RefreshIndicatorProps> = ({
	isLive,
	isRefreshing,
	secondsUntilRefresh,
	onToggleLive,
	onForceRefresh,
	lastUpdated,
}) => {
	const formatLastUpdated = (timestamp: string | null): string => {
		if (!timestamp) return 'Hech qachon'

		const date = new Date(timestamp)
		const now = new Date()
		const diffMs = now.getTime() - date.getTime()
		const diffSecs = Math.floor(diffMs / 1000)

		if (diffSecs < 60) return `${diffSecs} soniya oldin`
		if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)} daqiqa oldin`

		return date.toLocaleTimeString('uz-UZ', {
			hour: '2-digit',
			minute: '2-digit',
		})
	}

	return (
		<div className='flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
			<div className='flex items-center space-x-4'>
				{/* Live Indicator */}
				<div className='flex items-center space-x-2'>
					<div className='relative'>
						<div className={`w-3 h-3 rounded-full ${isLive ? 'bg-green-500' : 'bg-gray-400'}`}>
							{isLive && (
								<div className='absolute inset-0 w-3 h-3 rounded-full bg-green-500 animate-ping opacity-75' />
							)}
						</div>
					</div>
					<span className='text-sm font-medium text-gray-700'>
						{isLive ? 'Jonli rejim' : "To'xtatilgan"}
					</span>
				</div>

				{/* Last Updated */}
				<div className='text-sm text-gray-500'>
					Oxirgi yangilanish: <span className='font-medium'>{formatLastUpdated(lastUpdated)}</span>
				</div>

				{/* Countdown Timer */}
				{isLive && !isRefreshing && (
					<div className='text-sm text-gray-500'>
						Keyingi yangilanish:{' '}
						<span className='font-medium text-blue-600'>{secondsUntilRefresh}s</span>
					</div>
				)}

				{/* Refreshing Status */}
				{isRefreshing && (
					<div className='flex items-center space-x-2 text-sm text-blue-600'>
						<svg
							className='animate-spin h-4 w-4'
							xmlns='http://www.w3.org/2000/svg'
							fill='none'
							viewBox='0 0 24 24'
						>
							<circle
								className='opacity-25'
								cx='12'
								cy='12'
								r='10'
								stroke='currentColor'
								strokeWidth='4'
							></circle>
							<path
								className='opacity-75'
								fill='currentColor'
								d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
							></path>
						</svg>
						<span className='font-medium'>Yangilanmoqda...</span>
					</div>
				)}
			</div>

			{/* Action Buttons */}
			<div className='flex items-center space-x-2'>
				{/* Toggle Live Button */}
				<button
					onClick={onToggleLive}
					className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
						isLive
							? 'bg-green-100 text-green-700 hover:bg-green-200'
							: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
					}`}
				>
					{isLive ? "⏸ To'xtatish" : '▶ Boshlash'}
				</button>

				{/* Manual Refresh Button */}
				<button
					onClick={onForceRefresh}
					disabled={isRefreshing}
					className='px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2'
				>
					<svg
						className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
						fill='none'
						stroke='currentColor'
						viewBox='0 0 24 24'
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={2}
							d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
						/>
					</svg>
					<span>Yangilash</span>
				</button>
			</div>
		</div>
	)
}
