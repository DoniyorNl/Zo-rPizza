// frontend/app/admin/dashboard/DashboardView.tsx
// ✅ Admin dashboard main view

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useMemo, useState } from 'react'
import { CategoryPerformance } from '../analytics/components/CategoryPerformance'
import { DateRangePicker } from '../analytics/components/DateRangePicker'
import { RecentActivity } from '../analytics/components/RecentActivity'
import { RevenueChart } from '../analytics/components/RevenueChart'
import { StatsCards } from '../analytics/components/StatsCards'
import { TopProductsTable } from '../analytics/components/TopProductsTable'
import { useAnalytics } from '../analytics/hooks/useAnalytics'
import { DateRange, TimeRange } from '../analytics/types/analytics.types'
import { formatNumber } from '../analytics/utils/chartHelpers'

const getDateRange = (range: TimeRange): DateRange => {
	const endDate = new Date()
	const startDate = new Date(endDate)

	switch (range) {
		case '7d':
			startDate.setDate(endDate.getDate() - 7)
			break
		case '30d':
			startDate.setDate(endDate.getDate() - 30)
			break
		case '90d':
			startDate.setDate(endDate.getDate() - 90)
			break
		default:
			startDate.setFullYear(endDate.getFullYear() - 5)
	}

	return { startDate, endDate }
}

export function DashboardView() {
	const [range, setRange] = useState<TimeRange>('30d')
	const dateRange = useMemo(() => getDateRange(range), [range])
	const { loading, overview, revenueData, topProducts, recentOrders, categoryStats } =
		useAnalytics(dateRange)

	return (
		<div className='p-6 space-y-6'>
			<div className='flex items-center justify-between flex-wrap gap-4'>
				<div>
					<h1 className='text-3xl font-bold'>Dashboard</h1>
					<p className='text-gray-600'>Pizzeriya faoliyati uchun qisqa ko&apos;rsatkichlar</p>
				</div>
				<DateRangePicker selectedRange={range} onRangeChange={setRange} />
			</div>

			{loading ? (
				<div className='text-gray-600'>Yuklanmoqda...</div>
			) : (
				<>
					<StatsCards overview={overview} />

					{overview && (
						<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
							{[
								{
									label: 'Kutilayotgan',
									value: overview.pendingOrders,
									color: 'bg-yellow-100 text-yellow-800',
								},
								{
									label: 'Yakunlangan',
									value: overview.completedOrders,
									color: 'bg-green-100 text-green-800',
								},
								{
									label: 'Bekor qilingan',
									value: overview.cancelledOrders,
									color: 'bg-red-100 text-red-800',
								},
							].map(item => (
								<Card key={item.label}>
									<CardHeader className='pb-2'>
										<CardTitle className='text-sm text-gray-600'>{item.label}</CardTitle>
									</CardHeader>
									<CardContent>
										<div className={`inline-flex px-3 py-1 rounded-full text-sm ${item.color}`}>
											{formatNumber(item.value)}
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					)}

					<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
						<div className='lg:col-span-2'>
							<RevenueChart data={revenueData} />
						</div>
						<CategoryPerformance categories={categoryStats} />
					</div>

					<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
						<RecentActivity orders={recentOrders} />
						<TopProductsTable products={topProducts} />
					</div>
				</>
			)}
		</div>
	)
}
