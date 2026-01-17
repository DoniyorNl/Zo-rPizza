// frontend/app/admin/toppings/components/ToppingsTable.tsx
// ✅ Toppings table

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Topping } from '../types/topping.types'

interface ToppingsTableProps {
	toppings: Topping[]
	onEdit: (topping: Topping) => void
	onDelete: (topping: Topping) => void
}

export function ToppingsTable({ toppings, onEdit, onDelete }: ToppingsTableProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Toppinglar ({toppings.length})</CardTitle>
			</CardHeader>
			<CardContent>
				{toppings.length === 0 ? (
					<div className='text-center py-10 text-gray-500'>Topping topilmadi</div>
				) : (
					<div className='overflow-x-auto'>
						<table className='w-full'>
							<thead>
								<tr className='border-b text-left'>
									<th className='p-3'>Nomi</th>
									<th className='p-3'>Narx</th>
									<th className='p-3'>Holat</th>
									<th className='p-3 text-right'>Amallar</th>
								</tr>
							</thead>
							<tbody>
								{toppings.map(topping => (
									<tr key={topping.id} className='border-b'>
										<td className='p-3 font-medium'>{topping.name}</td>
										<td className='p-3'>{topping.price.toLocaleString()} so&apos;m</td>
										<td className='p-3'>
											<span
												className={`text-xs px-2 py-1 rounded ${topping.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
													}`}
											>
												{topping.isActive ? 'Faol' : 'Nofaol'}
											</span>
										</td>
										<td className='p-3 text-right'>
											<div className='flex gap-2 justify-end'>
												<Button size='sm' variant='outline' onClick={() => onEdit(topping)}>
													Tahrirlash
												</Button>
												<Button size='sm' variant='outline' className='text-red-600' onClick={() => onDelete(topping)}>
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
