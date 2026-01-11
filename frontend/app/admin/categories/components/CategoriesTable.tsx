import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Edit, RotateCcw, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { Category, FilterStatus } from '../types/category.types'

interface CategoriesTableProps {
	categories: Category[]
	filterStatus: FilterStatus
	onEdit: (category: Category) => void
	onDelete: (id: string, name: string) => void
	onRestore: (id: string, name: string) => void
}

export function CategoriesTable({
	categories,
	filterStatus,
	onEdit,
	onDelete,
	onRestore,
}: CategoriesTableProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>
					Barcha kategoriyalar ({categories.length})
					{filterStatus !== 'all' && (
						<span className='text-sm font-normal text-gray-500 ml-2'>
							({filterStatus === 'active' ? 'Faol' : 'Nofaol'})
						</span>
					)}
				</CardTitle>
			</CardHeader>
			<CardContent>
				{categories.length === 0 ? (
					<div className='text-center py-12 text-gray-500'>Kategoriyalar topilmadi</div>
				) : (
					<div className='overflow-x-auto'>
						<table className='w-full'>
							<thead>
								<tr className='border-b'>
									<th className='text-left p-4'>Rasm</th>
									<th className='text-left p-4'>Nomi</th>
									<th className='text-left p-4'>Tavsif</th>
									<th className='text-left p-4'>Mahsulotlar</th>
									<th className='text-left p-4'>Holat</th>
									<th className='text-right p-4'>Amallar</th>
								</tr>
							</thead>
							<tbody>
								{categories.map(category => (
									<tr
										key={category.id}
										className={`border-b hover:bg-gray-50 ${
											!category.isActive ? 'opacity-60' : ''
										}`}
									>
										<td className='p-4'>
											<div className='relative w-16 h-16 rounded-lg overflow-hidden'>
												<Image
													src={
														category.imageUrl &&
														category.imageUrl !== 'https://example.com/desert.jpg'
															? category.imageUrl
															: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80'
													}
													alt={category.name}
													fill
													sizes='64px'
													className='object-cover'
													onError={e => {
														const target = e.target as HTMLImageElement
														target.src =
															'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80'
													}}
												/>
											</div>
										</td>
										<td className='p-4'>
											<div className='font-semibold'>{category.name}</div>
										</td>
										<td className='p-4'>
											<div className='text-sm text-gray-500 max-w-md line-clamp-2'>
												{category.description || "Tavsif yo'q"}
											</div>
										</td>
										<td className='p-4'>
											<Badge variant='outline'>{category._count?.products || 0} ta mahsulot</Badge>
										</td>
										<td className='p-4'>
											<Badge
												variant={category.isActive ? 'default' : 'secondary'}
												className={category.isActive ? 'bg-green-500 hover:bg-green-600' : ''}
											>
												{category.isActive ? 'Faol' : 'Nofaol'}
											</Badge>
										</td>
										<td className='p-4'>
											<div className='flex items-center justify-end gap-2'>
												<Button
													size='sm'
													variant='outline'
													onClick={() => onEdit(category)}
													title='Tahrirlash'
												>
													<Edit className='w-4 h-4' />
												</Button>
												{category.isActive ? (
													<Button
														size='sm'
														variant='outline'
														onClick={() => onDelete(category.id, category.name)}
														className='text-red-600 hover:text-red-700'
														title="O'chirish"
													>
														<Trash2 className='w-4 h-4' />
													</Button>
												) : (
													<Button
														size='sm'
														variant='outline'
														onClick={() => onRestore(category.id, category.name)}
														className='text-green-600 hover:text-green-700'
														title='Qayta faollashtirish'
													>
														<RotateCcw className='w-4 h-4' />
													</Button>
												)}
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
