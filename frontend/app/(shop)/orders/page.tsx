// frontend/app/(shop)/orders/[id]/page.tsx
// 🍕 ZOR PIZZA - ORDER DETAIL PAGE (Updated with Variations)

'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCartStore } from '@/store/cartStore'
import { ArrowLeft, Package, Clock, MapPin, CreditCard, ShoppingBag } from 'lucide-react'

// ============================================
// TYPES & INTERFACES
// ============================================

interface OrderItem {
	id: string
	productId: string
	variationId?: string
	quantity: number
	price: number
	size?: string
	product: {
		id: string
		name: string
		imageUrl: string
	}
}

interface Order {
	id: string
	orderNumber: string
	status: string
	totalPrice: number
	paymentMethod: string
	deliveryAddress: string
	deliveryPhone: string
	items: OrderItem[]
	createdAt: string
}

// ============================================
// STATUS CONFIG
// ============================================

const statusConfig = {
	PENDING: { label: 'Kutilmoqda', color: 'bg-yellow-100 text-yellow-800' },
	PREPARING: { label: 'Tayyorlanmoqda', color: 'bg-blue-100 text-blue-800' },
	DELIVERING: { label: 'Yetkazilmoqda', color: 'bg-purple-100 text-purple-800' },
	COMPLETED: { label: 'Yetkazildi', color: 'bg-green-100 text-green-800' },
	CANCELLED: { label: 'Bekor qilindi', color: 'bg-red-100 text-red-800' },
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params)
	const router = useRouter()
	const { addItem } = useCartStore()
	const [order, setOrder] = useState<Order | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const fetchOrder = async () => {
			try {
				const token = localStorage.getItem('token')
				const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${id}`, {
					headers: { Authorization: `Bearer ${token}` },
				})
				setOrder(response.data.data)
			} catch (error) {
				console.error('Error fetching order:', error)
			} finally {
				setLoading(false)
			}
		}

		fetchOrder()
	}, [id])

	const handleReorder = () => {
		if (!order) return

		order.items.forEach(item => {
			const variationId = item.variationId || `${item.productId}-default`
			const size = item.size || 'Medium'

			addItem({
				productId: item.productId,
				variationId: variationId,
				name: item.product.name,
				size: size,
				price: item.price,
				imageUrl: item.product.imageUrl,
				addedToppingIds: [],
				removedToppingIds: [],
			})
		})

		router.push('/cart')
	}

	if (loading) {
		return (
			<main className='min-h-screen bg-gradient-to-b from-orange-50 to-white'>
				<Header />
				<div className='container mx-auto px-4 py-12'>
					<div className='text-center text-2xl'>Yuklanmoqda...</div>
				</div>
			</main>
		)
	}

	if (!order) {
		return (
			<main className='min-h-screen bg-gradient-to-b from-orange-50 to-white'>
				<Header />
				<div className='container mx-auto px-4 py-12'>
					<div className='text-center'>
						<h1 className='text-2xl font-bold mb-4'>Buyurtma topilmadi</h1>
						<Button onClick={() => router.push('/orders')}>Buyurtmalarga qaytish</Button>
					</div>
				</div>
			</main>
		)
	}

	const status = statusConfig[order.status as keyof typeof statusConfig]

	return (
		<main className='min-h-screen bg-gradient-to-b from-orange-50 to-white'>
			<Header />

			<div className='container mx-auto px-4 py-8 max-w-4xl'>
				<Button variant='ghost' onClick={() => router.back()} className='mb-6'>
					<ArrowLeft className='w-4 h-4 mr-2' />
					Orqaga
				</Button>

				<div className='flex items-center justify-between mb-8'>
					<div>
						<h1 className='text-3xl font-bold mb-2'>Buyurtma #{order.orderNumber}</h1>
						<p className='text-gray-600'>
							{new Date(order.createdAt).toLocaleDateString('uz-UZ', {
								year: 'numeric',
								month: 'long',
								day: 'numeric',
								hour: '2-digit',
								minute: '2-digit',
							})}
						</p>
					</div>
					<Badge className={`${status.color} text-lg px-4 py-2`}>{status.label}</Badge>
				</div>

				<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
					<div className='lg:col-span-2 space-y-4'>
						<Card>
							<CardHeader>
								<CardTitle className='flex items-center gap-2'>
									<ShoppingBag className='w-5 h-5 text-orange-600' />
									Buyurtma tarkibi
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className='space-y-4'>
									{order.items.map(item => (
										<div key={item.id} className='flex items-center gap-4 p-4 bg-gray-50 rounded-lg'>
											<div className='relative w-20 h-20 rounded-lg overflow-hidden bg-white flex-shrink-0'>
												<img
													src={item.product.imageUrl}
													alt={item.product.name}
													className='object-cover w-full h-full'
												/>
											</div>
											<div className='flex-1'>
												<h3 className='font-semibold text-lg'>{item.product.name}</h3>
												{item.size && <p className='text-sm text-gray-600'>O'lcham: {item.size}</p>}
												<p className='text-sm text-gray-600'>Miqdor: {item.quantity} ta</p>
											</div>
											<div className='text-right'>
												<p className='font-bold text-lg text-orange-600'>
													{(item.price * item.quantity).toLocaleString()} so'm
												</p>
												<p className='text-sm text-gray-500'>
													{item.price.toLocaleString()} so'm × {item.quantity}
												</p>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>

						<Button onClick={handleReorder} className='w-full bg-orange-600 hover:bg-orange-700'>
							<Package className='w-4 h-4 mr-2' />
							Qayta buyurtma berish
						</Button>
					</div>

					<div className='space-y-4'>
						<Card>
							<CardHeader>
								<CardTitle className='flex items-center gap-2'>
									<MapPin className='w-5 h-5 text-orange-600' />
									Yetkazib berish
								</CardTitle>
							</CardHeader>
							<CardContent className='space-y-3'>
								<div>
									<p className='text-sm text-gray-600 mb-1'>Manzil:</p>
									<p className='font-medium'>{order.deliveryAddress}</p>
								</div>
								<div>
									<p className='text-sm text-gray-600 mb-1'>Telefon:</p>
									<p className='font-medium'>{order.deliveryPhone}</p>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className='flex items-center gap-2'>
									<CreditCard className='w-5 h-5 text-orange-600' />
									To'lov
								</CardTitle>
							</CardHeader>
							<CardContent className='space-y-3'>
								<div>
									<p className='text-sm text-gray-600 mb-1'>Usul:</p>
									<p className='font-medium'>
										{order.paymentMethod === 'CASH' ? 'Naqd pul' : 'Karta'}
									</p>
								</div>
								<div className='pt-3 border-t'>
									<p className='text-sm text-gray-600 mb-1'>Jami summa:</p>
									<p className='text-2xl font-bold text-orange-600'>
										{order.totalPrice.toLocaleString()} so'm
									</p>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</main>
	)
}