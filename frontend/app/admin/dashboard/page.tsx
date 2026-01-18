// frontend/app/admin/dashboard/page.tsx

'use client'

import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Real-time components (NEW)
import { useDashboardData } from './hooks/useDashboardData'
import { useRealTimeUpdates } from './hooks/useRealTimeUpdates'
import { useDashboardAlerts } from './hooks/useDashboardAlerts'
import { RefreshIndicator } from './components/RefreshIndicator'
import { AlertsPanel } from './components/AlertsPanel'
import { QuickStats } from './components/QuickStats'
import { TodayRevenueChart } from './components/TodayRevenueChart'
import { LiveOrdersFeed } from './components/LiveOrdersFeed'
import { TopProductsToday } from './components/TopProductsToday'

// Historical components (EXISTING)

type DashboardTab = 'today' | 'overview'

export default function DashboardPage() {
	const [activeTab, setActiveTab] = useState<DashboardTab>('today')

	// ========================================================================
	// REAL-TIME DATA (for "Bugun" tab)
	// ========================================================================
	const {
		stats,
		liveOrders,
		topProductsToday,
		hourlyRevenue,
		isLoading: isLoadingToday,
		error: errorToday,
		lastUpdated,
		refresh,
	} = useDashboardData()

	const { isLive, isRefreshing, toggleLive, forceRefresh, secondsUntilRefresh } =
		useRealTimeUpdates({
			onUpdate: refresh,
			config: {
				interval: 30000, // 30 seconds
				autoRefresh: true,
			},
		})

	const { alerts, unreadCount, markAsRead, markAllAsRead, dismissAlert, clearAll } =
		useDashboardAlerts({
			stats,
			liveOrders,
		})

	// ========================================================================
	// ERROR HANDLING
	// ========================================================================
	if (errorToday && !stats && activeTab === 'today') {
		return (
			<div className='min-h-screen bg-gray-50 p-6'>
				<div className='max-w-7xl mx-auto'>
					<div className='bg-red-50 border border-red-200 rounded-lg p-6 text-center'>
						<div className='text-red-600 text-5xl mb-4'>⚠️</div>
						<h2 className='text-xl font-semibold text-red-900 mb-2'>Xatolik yuz berdi</h2>
						<p className='text-red-700 mb-4'>{errorToday}</p>
						<button
							onClick={() => refresh()}
							className='px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors'
						>
							Qayta urinish
						</button>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className='min-h-screen bg-gray-50'>
			<div className='max-w-7xl mx-auto p-6 space-y-6'>
				{/* Header */}
				<div className='flex items-center justify-between'>
					<div>
						<h1 className='text-3xl font-bold text-gray-900'>📊 Dashboard</h1>
						<p className='text-gray-600 mt-1'>
							{activeTab === 'today'
								? 'Real vaqtda biznesingizni kuzating'
								: "Tarixiy ma'lumotlar va tahlil"}
						</p>
					</div>

					{/* Date Info */}
					<div className='text-right'>
						<p className='text-sm text-gray-500'>
							{new Date().toLocaleDateString('uz-UZ', {
								weekday: 'long',
								year: 'numeric',
								month: 'long',
								day: 'numeric',
							})}
						</p>
						<p className='text-lg font-semibold text-gray-900'>
							{new Date().toLocaleTimeString('uz-UZ', {
								hour: '2-digit',
								minute: '2-digit',
							})}
						</p>
					</div>
				</div>

				{/* Tabs */}
				<Tabs
					value={activeTab}
					onValueChange={value => setActiveTab(value as DashboardTab)}
					className='space-y-6'
				>
					<TabsList className='grid w-full max-w-md grid-cols-2'>
						<TabsTrigger value='today' className='flex items-center space-x-2'>
							<span className='text-lg'>🔴</span>
							<span>Bugun</span>
							{isLive && (
								<span className='ml-2 w-2 h-2 bg-green-500 rounded-full animate-pulse'></span>
							)}
						</TabsTrigger>
						<TabsTrigger value='overview' className='flex items-center space-x-2'>
							<span className='text-lg'>📊</span>
							<span>Umumiy</span>
						</TabsTrigger>
					</TabsList>

					{/* ================================================================ */}
					{/* TAB 1: TODAY (Real-time) */}
					{/* ================================================================ */}
					<TabsContent value='today' className='space-y-6'>
						{/* Real-time Indicator */}
						<RefreshIndicator
							isLive={isLive}
							isRefreshing={isRefreshing}
							secondsUntilRefresh={secondsUntilRefresh}
							onToggleLive={toggleLive}
							onForceRefresh={forceRefresh}
							lastUpdated={lastUpdated}
						/>

						{/* Alerts Panel */}
						{alerts.length > 0 && (
							<AlertsPanel
								alerts={alerts}
								unreadCount={unreadCount}
								onMarkAsRead={markAsRead}
								onMarkAllAsRead={markAllAsRead}
								onDismiss={dismissAlert}
								onClearAll={clearAll}
							/>
						)}

						{/* Quick Stats */}
						{stats && <QuickStats stats={stats} isLoading={isLoadingToday} />}

						{/* Main Content Grid */}
						<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
							{/* Today's Revenue Chart */}
							<div className='lg:col-span-2'>
								<TodayRevenueChart data={hourlyRevenue} isLoading={isLoadingToday} />
							</div>

							{/* Top Products Today */}
							<div className='lg:col-span-1'>
								<TopProductsToday products={topProductsToday} isLoading={isLoadingToday} />
							</div>
						</div>

						{/* Live Orders Feed */}
						<LiveOrdersFeed orders={liveOrders} isLoading={isLoadingToday} />

						{/* Footer Info */}
						<div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
							<div className='flex items-center justify-between text-sm text-gray-600'>
								<div className='flex items-center space-x-6'>
									<div className='flex items-center space-x-2'>
										<div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
										<span>Tizim faol</span>
									</div>
									<div>Ma'lumotlar har 30 soniyada yangilanadi</div>
								</div>
								<div>
									Oxirgi yangilanish:{' '}
									{lastUpdated && new Date(lastUpdated).toLocaleTimeString('uz-UZ')}
								</div>
							</div>
						</div>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	)
}
