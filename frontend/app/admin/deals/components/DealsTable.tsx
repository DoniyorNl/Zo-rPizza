// frontend/app/admin/deals/components/DealsTable.tsx
// ✅ Deals table

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Deal } from '../types/deal.types'

interface DealsTableProps {
	deals: Deal[]
	onEdit: (deal: Deal) => void
	onDelete: (deal: Deal) => void
}

export function DealsTable({ deals, onEdit, onDelete }: DealsTableProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Deals ({deals.length})</CardTitle>
			</CardHeader>
			<CardContent>
				{deals.length === 0 ? (
					<div className='text-center py-10 text-gray-500'>Deal topilmadi</div>
				) : (
					<div className='overflow-x-auto'>
						<table className='w-full'>
							<thead>
								<tr className='border-b text-left'>
									<th className='p-3'>Nomi</th>
									<th className='p-3'>Chegirma</th>
									<th className='p-3'>Tarkib</th>
									<th className='p-3'>Holat</th>
									<th className='p-3 text-right'>Amallar</th>
								</tr>
							</thead>
							<tbody>
								{deals.map(deal => (
									<tr key={deal.id} className='border-b'>
										<td className='p-3'>
											<div className='font-medium'>{deal.title}</div>
											{deal.description && (
												<div className='text-xs text-gray-500 line-clamp-1'>
													{deal.description}
												</div>
											)}
										</td>
										<td className='p-3'>
											{deal.discountType === 'PERCENT'
												? `${deal.discountValue}%`
												: `${deal.discountValue.toLocaleString()} so&apos;m`}
										</td>
										<td className='p-3 text-sm text-gray-600'>
											{deal.items.map(item => item.product.name).join(', ')}
										</td>
										<td className='p-3'>
											<span
												className={`text-xs px-2 py-1 rounded ${deal.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
													}`}
											>
												{deal.isActive ? 'Faol' : 'Nofaol'}
											</span>
										</td>
										<td className='p-3 text-right'>
											<div className='flex gap-2 justify-end'>
												<Button size='sm' variant='outline' onClick={() => onEdit(deal)}>
													Tahrirlash
												</Button>
												<Button size='sm' variant='outline' className='text-red-600' onClick={() => onDelete(deal)}>
													Ochirish
												</Button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</CardContent>
		</Card>
	)
}
