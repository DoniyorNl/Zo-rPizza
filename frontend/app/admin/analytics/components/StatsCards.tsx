import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package } from 'lucide-react'
import { AnalyticsOverview } from '../types/analytics.types'
import { formatCurrency, formatNumber } from '../utils/chartHelpers'

interface StatsCardsProps {
	overview: AnalyticsOverview | null
}

export function StatsCards({ overview }: StatsCardsProps) {
	if (!overview) return null

	const stats = [
		{
			title: 'Jami daromad',
			value: formatCurrency(overview.totalRevenue),
			icon: DollarSign,
			color: 'text-green-600',
			bgColor: 'bg-green-100',
		},
		{
			title: 'Jami buyurtmalar',
			value: formatNumber(overview.totalOrders),
			icon: ShoppingCart,
			color: 'text-blue-600',
			bgColor: 'bg-blue-100',
		},
		{
			title: 'Mijozlar',
			value: formatNumber(overview.totalCustomers),
			icon: Users,
			color: 'text-purple-600',
			bgColor: 'bg-purple-100',
		},
		{
			title: 'Faol mahsulotlar',
			value: formatNumber(overview.activeProducts),
			icon: Package,
			color: 'text-orange-600',
			bgColor: 'bg-orange-100',
		},
	]

	return (
		<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
			{stats.map((stat, index) => {
				const Icon = stat.icon
				return (
					<Card key={index}>
						<CardHeader className='flex flex-row items-center justify-between pb-2'>
							<CardTitle className='text-sm font-medium text-gray-600'>{stat.title}</CardTitle>
							<div className={`p-2 rounded-lg ${stat.bgColor}`}>
								<Icon className={`h-4 w-4 ${stat.color}`} />
							</div>
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold'>{stat.value}</div>
							{stat.title === 'Jami buyurtmalar' && (
								<p className='text-xs text-gray-600 mt-1'>
									O'rtacha: {formatCurrency(overview.averageOrderValue)}
								</p>
							)}
						</CardContent>
					</Card>
				)
			})}
		</div>
	)
}
