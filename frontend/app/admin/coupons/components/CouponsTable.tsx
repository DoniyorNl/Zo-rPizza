// frontend/app/admin/coupons/components/CouponsTable.tsx
// ✅ Coupons table

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Coupon } from '../types/coupon.types'

interface CouponsTableProps {
	coupons: Coupon[]
	onEdit: (coupon: Coupon) => void
	onDelete: (coupon: Coupon) => void
}

export function CouponsTable({ coupons, onEdit, onDelete }: CouponsTableProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Kuponlar ({coupons.length})</CardTitle>
			</CardHeader>
			<CardContent>
				{coupons.length === 0 ? (
					<div className='text-center py-10 text-gray-500'>Kupon topilmadi</div>
				) : (
					<div className='overflow-x-auto'>
						<table className='w-full'>
							<thead>
								<tr className='border-b text-left'>
									<th className='p-3'>Kod</th>
									<th className='p-3'>Chegirma</th>
									<th className='p-3'>Holat</th>
									<th className='p-3 text-right'>Amallar</th>
								</tr>
							</thead>
							<tbody>
								{coupons.map(coupon => (
									<tr key={coupon.id} className='border-b'>
										<td className='p-3'>
											<div className='font-medium'>{coupon.code}</div>
											{coupon.description && (
												<div className='text-xs text-gray-500 line-clamp-1'>
													{coupon.description}
												</div>
											)}
										</td>
										<td className='p-3'>
											{coupon.discountType === 'PERCENT'
												? `${coupon.discountValue}%`
												: `${coupon.discountValue.toLocaleString()} so&apos;m`}
										</td>
										<td className='p-3'>
											<span
												className={`text-xs px-2 py-1 rounded ${coupon.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
													}`}
											>
												{coupon.isActive ? 'Faol' : 'Nofaol'}
											</span>
										</td>
										<td className='p-3 text-right'>
											<div className='flex gap-2 justify-end'>
												<Button size='sm' variant='outline' onClick={() => onEdit(coupon)}>
													Tahrirlash
												</Button>
												<Button size='sm' variant='outline' className='text-red-600' onClick={() => onDelete(coupon)}>
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
