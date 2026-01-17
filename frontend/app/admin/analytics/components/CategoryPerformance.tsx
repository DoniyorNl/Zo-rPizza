import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CategoryStats } from '../types/analytics.types'
import { formatCurrency, formatNumber } from '../utils/chartHelpers'

interface CategoryPerformanceProps {
	categories: CategoryStats[]
}

export function CategoryPerformance({ categories }: CategoryPerformanceProps) {
	const colors = [
		'bg-orange-500',
		'bg-blue-500',
		'bg-green-500',
		'bg-purple-500',
		'bg-pink-500',
		'bg-yellow-500',
	]

	return (
		<Card>
			<CardHeader>
				<CardTitle>Kategoriyalar bo&apos;yicha</CardTitle>
			</CardHeader>
			<CardContent>
				{categories.length === 0 ? (
					<div className='text-center py-8 text-gray-500'>Ma&apos;lumot topilmadi</div>
				) : (
					<div className='space-y-4'>
						{categories.map((category, index) => (
							<div key={category.categoryId}>
								<div className='flex items-center justify-between mb-2'>
									<div className='font-medium'>{category.categoryName}</div>
									<div className='text-sm text-gray-600'>{category.percentage.toFixed(1)}%</div>
								</div>
								<div className='w-full bg-gray-200 rounded-full h-2 mb-1'>
									<div
										className={`h-2 rounded-full ${colors[index % colors.length]}`}
										style={{ width: `${category.percentage}%` }}
									></div>
								</div>
								<div className='flex items-center justify-between text-sm text-gray-600'>
									<span>{formatNumber(category.totalOrders)} buyurtma</span>
									<span className='font-semibold text-orange-600'>
										{formatCurrency(category.revenue)}
									</span>
								</div>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	)
}
