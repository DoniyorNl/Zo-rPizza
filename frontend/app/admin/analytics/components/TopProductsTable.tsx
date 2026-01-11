import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import { TopProduct } from '../types/analytics.types'
import { formatCurrency, formatNumber } from '../utils/chartHelpers'

interface TopProductsTableProps {
	products: TopProduct[]
}

export function TopProductsTable({ products }: TopProductsTableProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Eng ko'p sotilgan mahsulotlar</CardTitle>
			</CardHeader>
			<CardContent>
				{products.length === 0 ? (
					<div className='text-center py-8 text-gray-500'>Ma'lumot topilmadi</div>
				) : (
					<div className='space-y-4'>
						{products.map((product, index) => (
							<div
								key={product.id}
								className='flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50'
							>
								<div className='text-2xl font-bold text-gray-400 w-8'>#{index + 1}</div>
								{product.imageUrl ? (
									<div className='relative w-12 h-12 rounded-lg overflow-hidden'>
										<Image
											src={product.imageUrl}
											alt={product.name}
											fill
											className='object-cover'
										/>
									</div>
								) : (
									<div className='w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-xl'>
										🍕
									</div>
								)}
								<div className='flex-1'>
									<div className='font-semibold'>{product.name}</div>
									<div className='text-sm text-gray-500'>{product.category}</div>
								</div>
								<div className='text-right'>
									<div className='font-semibold text-orange-600'>
										{formatCurrency(product.revenue)}
									</div>
									<div className='text-sm text-gray-500'>
										{formatNumber(product.totalSold)} dona sotildi
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	)
}
