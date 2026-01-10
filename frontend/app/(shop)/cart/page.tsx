// frontend/app/(shop)/cart/page.tsx
// 🛒 CART PAGE

'use client'

import { useCartStore } from '@/store/cartStore'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function CartPage() {
	const { items, updateQuantity, removeItem, getTotalPrice, clearCart } = useCartStore()
	const router = useRouter()

	if (items.length === 0) {
		return (
			<main className='min-h-screen bg-gradient-to-b from-orange-50 to-white'>
				<Header />

				<div className='container mx-auto px-4 py-12'>
					<div className='text-center py-20'>
						<h2 className='text-3xl font-bold mb-4'>Savatcha bo'sh</h2>
						<p className='text-gray-600 mb-8'>Hozircha hech narsa qo'shilmagan</p>
						<Button onClick={() => router.push('/')}>Menyu'ga qaytish</Button>
					</div>
				</div>
			</main>
		)
	}

	return (
		<main className='min-h-screen bg-gradient-to-b from-orange-50 to-white'>
			<Header />

			<div className='container mx-auto px-4 py-12'>
				<div className='flex items-center justify-between mb-8'>
					<h1 className='text-4xl font-bold'>Savatcha</h1>
					<Button variant='outline' onClick={clearCart} className='text-red-600'>
						<Trash2 className='w-4 h-4 mr-2' />
						Hammasini o'chirish
					</Button>
				</div>

				<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
					{/* Cart Items */}
					<div className='lg:col-span-2 space-y-4'>
						{items.map(item => (
							<Card key={item.id}>
								<CardContent className='p-6 flex items-center gap-6'>
									{/* Image */}
									<div className='relative w-24 h-24 flex-shrink-0'>
										<Image
											src={item.imageUrl}
											alt={item.name}
											fill
											className='object-cover rounded-lg'
										/>
									</div>

									{/* Info */}
									<div className='flex-1'>
										<h3 className='text-xl font-bold mb-2'>{item.name}</h3>
										<p className='text-2xl font-bold text-orange-600'>
											{item.price.toLocaleString()} so'm
										</p>
									</div>

									{/* Quantity Controls */}
									<div className='flex items-center gap-3'>
										<Button
											size='sm'
											variant='outline'
											onClick={() => updateQuantity(item.id, item.quantity - 1)}
										>
											<Minus className='w-4 h-4' />
										</Button>
										<span className='text-xl font-semibold w-8 text-center'>{item.quantity}</span>
										<Button
											size='sm'
											variant='outline'
											onClick={() => updateQuantity(item.id, item.quantity + 1)}
										>
											<Plus className='w-4 h-4' />
										</Button>
									</div>

									{/* Remove */}
									<Button
										size='sm'
										variant='ghost'
										onClick={() => removeItem(item.id)}
										className='text-red-600'
									>
										<Trash2 className='w-5 h-5' />
									</Button>
								</CardContent>
							</Card>
						))}
					</div>

					{/* Summary */}
					<div>
						<Card className='sticky top-4'>
							<CardContent className='p-6'>
								<h2 className='text-2xl font-bold mb-6'>Buyurtma</h2>

								<div className='space-y-4 mb-6'>
									<div className='flex justify-between text-lg'>
										<span>Mahsulotlar:</span>
										<span>{items.length} ta</span>
									</div>

									<div className='flex justify-between text-lg'>
										<span>Miqdor:</span>
										<span>{items.reduce((sum, item) => sum + item.quantity, 0)} ta</span>
									</div>

									<div className='border-t pt-4 flex justify-between text-2xl font-bold'>
										<span>Jami:</span>
										<span className='text-orange-600'>{getTotalPrice().toLocaleString()} so'm</span>
									</div>
								</div>

								<Button className='w-full' size='lg' onClick={() => router.push('/checkout')}>
									Buyurtma berish
								</Button>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</main>
	)
}
