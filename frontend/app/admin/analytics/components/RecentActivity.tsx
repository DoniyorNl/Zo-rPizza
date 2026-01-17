import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RecentOrder } from '../types/analytics.types'
import { formatCurrency } from '../utils/chartHelpers'

interface RecentActivityProps {
	orders: RecentOrder[]
}

const statusColors: Record<string, string> = {
	PENDING: 'bg-yellow-100 text-yellow-800',
	PREPARING: 'bg-blue-100 text-blue-800',
	READY: 'bg-purple-100 text-purple-800',
	DELIVERING: 'bg-indigo-100 text-indigo-800',
	DELIVERED: 'bg-green-100 text-green-800',
	COMPLETED: 'bg-green-100 text-green-800',
	CANCELLED: 'bg-red-100 text-red-800',
}

const statusLabels: Record<string, string> = {
	PENDING: 'Kutilmoqda',
	PREPARING: 'Tayyorlanmoqda',
	READY: 'Tayyor',
	DELIVERING: 'Yetkazilmoqda',
	DELIVERED: 'Yetkazildi',
	COMPLETED: 'Yakunlandi',
	CANCELLED: 'Bekor qilindi',
}

export function RecentActivity({ orders }: RecentActivityProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>So&apos;nggi faoliyat</CardTitle>
			</CardHeader>
			<CardContent>
				{orders.length === 0 ? (
					<div className='text-center py-8 text-gray-500'>Ma&apos;lumot topilmadi</div>
				) : (
					<div className='space-y-4'>
						{orders.map(order => (
							<div
								key={order.id}
								className='flex items-center justify-between p-3 rounded-lg hover:bg-gray-50'
							>
								<div className='flex-1'>
									<div className='font-medium'>{order.customerName}</div>
									<div className='text-sm text-gray-500'>
										{order.items} ta mahsulot • {new Date(order.createdAt).toLocaleString('uz-UZ')}
									</div>
								</div>
								<div className='flex items-center gap-3'>
									<div className='text-right'>
										<div className='font-semibold text-orange-600'>
											{formatCurrency(order.total)}
										</div>
									</div>
									<Badge className={statusColors[order.status] || 'bg-gray-100 text-gray-800'}>
										{statusLabels[order.status] || order.status}
									</Badge>
								</div>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	)
}
