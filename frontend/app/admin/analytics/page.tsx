'use client'

import { useMemo, useState } from 'react'
import { useAnalytics } from './hooks/useAnalytics'
import { StatsCards } from './components/StatsCards'
import { RevenueChart } from './components/RevenueChart'
import { TopProductsTable } from './components/TopProductsTable'
import { CategoryPerformance } from './components/CategoryPerformance'
import { RecentActivity } from './components/RecentActivity'
import { DateRangePicker } from './components/DateRangePicker'
import { getDateRangePreset } from './utils/chartHelpers'
import { TimeRange } from './types/analytics.types'

export default function AdminAnalyticsPage() {
	const [selectedRange, setSelectedRange] = useState<TimeRange>('30d')
	const dateRange = useMemo(() => getDateRangePreset(selectedRange), [selectedRange])

	const { loading, overview, revenueData, topProducts, categoryStats, recentOrders } =
		useAnalytics(dateRange)

	if (loading) {
		return (
			<div className='p-6'>
				<div className='text-center py-12'>
					<div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600'></div>
					<p className='mt-4 text-gray-600'>Yuklanmoqda...</p>
				</div>
			</div>
		)
	}

	return (
		<div className='p-6 space-y-6'>
			{/* Header */}
			<div>
				<h1 className='text-3xl font-bold mb-2'>Statistika va Tahlil</h1>
				<p className='text-gray-600'>Biznes ko'rsatkichlari va hisobotlar</p>
			</div>

			{/* Date Range Picker */}
			<DateRangePicker selectedRange={selectedRange} onRangeChange={setSelectedRange} />

			{/* Stats Cards */}
			<StatsCards overview={overview} />

			{/* Revenue Chart */}
			<RevenueChart data={revenueData} />

			{/* Two Column Layout */}
			<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
				{/* Top Products */}
				<TopProductsTable products={topProducts} />

				{/* Category Performance */}
				<CategoryPerformance categories={categoryStats} />
			</div>

			{/* Recent Activity */}
			<RecentActivity orders={recentOrders} />
		</div>
	)
}
