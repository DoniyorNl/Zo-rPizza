'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RevenueData } from '../types/analytics.types'
import { formatCurrency, formatDate } from '../utils/chartHelpers'

interface RevenueChartProps {
	data: RevenueData[]
}

export function RevenueChart({ data }: RevenueChartProps) {
	if (!data || data.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Daromad grafigi</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='h-80 flex items-center justify-center text-gray-500'>
						Ma&apos;lumot topilmadi
					</div>
				</CardContent>
			</Card>
		)
	}

	const maxRevenue = Math.max(...data.map(d => d.revenue))

	return (
		<Card>
			<CardHeader>
				<CardTitle>Daromad grafigi</CardTitle>
			</CardHeader>
			<CardContent>
				<div className='h-80'>
					{/* Simple bar chart */}
					<div className='flex items-end justify-between h-full gap-2'>
						{data.map((item, index) => {
							const height = (item.revenue / maxRevenue) * 100
							return (
								<div key={index} className='flex-1 flex flex-col items-center gap-2'>
									<div className='w-full flex flex-col items-center'>
										<div
											className='w-full bg-gradient-to-t from-orange-600 to-orange-400 rounded-t hover:from-orange-500 hover:to-orange-300 transition-all cursor-pointer relative group'
											style={{ height: `${height}%`, minHeight: '20px' }}
										>
											<div className='absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap'>
												{formatCurrency(item.revenue)}
											</div>
										</div>
									</div>
									<div className='text-xs text-gray-600 text-center'>{formatDate(item.date)}</div>
								</div>
							)
						})}
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
