import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Edit, Eye, RotateCcw, Trash2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { FilterStatus, Product } from '../types/product.types'

interface ProductsTableProps {
	products: Product[]
	filterStatus: FilterStatus
	onEdit: (product: Product) => void
	onDelete: (id: string, name: string) => void
	onRestore: (id: string, name: string) => void
}

export function ProductsTable({ products, filterStatus, onEdit, onDelete, onRestore }: ProductsTableProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>
					Barcha mahsulotlar ({products.length})
					{filterStatus !== 'all' && (
						<span className='text-sm font-normal text-gray-500 ml-2'>
							({filterStatus === 'active' ? 'Faol' : 'Nofaol'})
						</span>
					)}
				</CardTitle>
			</CardHeader>
			<CardContent>
				{products.length === 0 ? (
					<div className='text-center py-12 text-gray-500'>
						Mahsulotlar topilmadi
					</div>
				) : (
					<div className='overflow-x-auto'>
						<table className='w-full'>
							<thead>
								<tr className='border-b'>
									<th className='text-left p-4'>Rasm</th>
									<th className='text-left p-4'>Nomi</th>
									<th className='text-left p-4'>Kategoriya</th>
									<th className='text-left p-4'>Narx</th>
									<th className='text-left p-4'>Vaqt</th>
									<th className='text-left p-4'>Holat</th>
									<th className='text-right p-4'>Amallar</th>
								</tr>
							</thead>
							<tbody>
								{products.map(product => (
									<tr
										key={product.id}
										className={`border-b hover:bg-gray-50 ${!product.isActive ? 'opacity-60' : ''}`}
									>
										<td className='p-4'>
											{product.imageUrl ? (
												<div className='relative w-16 h-16 rounded-lg overflow-hidden'>
													<Image
														src={product.imageUrl}
														alt={product.name}
														fill
														className='object-cover'
													/>
												</div>
											) : (
												<div className='w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400'>
													No image
												</div>
											)}
										</td>
										<td className='p-4'>
											<div className='font-semibold'>{product.name}</div>
											<div className='text-sm text-gray-500 line-clamp-1'>
												{product.description}
											</div>
											{product.variations && product.variations.length > 0 && (
												<div className='text-xs text-gray-500 mt-1'>
													Sizes: {product.variations.map(variation => variation.size).join(', ')}
												</div>
											)}
										</td>
										<td className='p-4'>
											<Badge variant='outline'>{product.category.name}</Badge>
										</td>
										<td className='p-4 font-semibold text-orange-600'>
											{(() => {
												const variationPrices =
													product.variations?.map(variation => variation.price) || []
												const minPrice =
													variationPrices.length > 0
														? Math.min(...variationPrices)
														: product.basePrice
												return (
													<div>
														<div>{minPrice.toLocaleString()} so&apos;m</div>
														{variationPrices.length > 1 && (
															<div className='text-xs text-gray-500'>dan boshlab</div>
														)}
													</div>
												)
											})()}
										</td>
										<td className='p-4 text-gray-600'>{product.prepTime} daq</td>
										<td className='p-4'>
											<Badge className={product.isActive ? 'bg-green-500' : 'bg-gray-400'}>
												{product.isActive ? 'Faol' : 'Nofaol'}
											</Badge>
										</td>
										<td className='p-4'>
											<div className='flex items-center justify-end gap-2'>
												<Link href={`/products/${product.id}`} target='_blank'>
													<Button size='sm' variant='outline' title="Ko'rish">
														<Eye className='w-4 h-4' />
													</Button>
												</Link>
												<Button
													size='sm'
													variant='outline'
													onClick={() => onEdit(product)}
													title='Tahrirlash'
												>
													<Edit className='w-4 h-4' />
												</Button>
												{product.isActive ? (
													<Button
														size='sm'
														variant='outline'
														onClick={() => onDelete(product.id, product.name)}
														className='text-red-600 hover:text-red-700'
														title='Yashirish'
													>
														<Trash2 className='w-4 h-4' />
													</Button>
												) : (
													<Button
														size='sm'
														variant='outline'
														onClick={() => onRestore(product.id, product.name)}
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