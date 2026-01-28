// frontend/app/(shop)/orders/page.tsx
// 🍕 ZOR PIZZA - ORDERS LIST PAGE

'use client'

import { Header } from '@/components/layout/Header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { api } from '@/lib/apiClient'
import { useAuth } from '@/lib/AuthContext'
import { Clock, Package, ShoppingBag } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface OrderItem {
	id: string
	quantity: number
	price: number
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
	items: OrderItem[]
	createdAt: string
}

const statusConfig = {
	PENDING: { label: 'Kutilmoqda', color: 'bg-yellow-100 text-yellow-800' },
	PREPARING: { label: 'Tayyorlanmoqda', color: 'bg-blue-100 text-blue-800' },
	DELIVERING: { label: 'Yetkazilmoqda', color: 'bg-purple-100 text-purple-800' },
	COMPLETED: { label: 'Yetkazildi', color: 'bg-green-100 text-green-800' },
	CANCELLED: { label: 'Bekor qilindi', color: 'bg-red-100 text-red-800' },
}

export default function OrdersPage() {
	const { user } = useAuth()
	const router = useRouter()
	const [orders, setOrders] = useState<Order[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		if (!user) {
			router.push('/login')
			return
		}

		const fetchOrders = async () => {
			try {
				const response = await api.get(`/api/orders/user/${user.uid}`)
				setOrders(response.data.data || [])
			} catch (error) {
				console.error('Error fetching orders:', error)
				setOrders([])
			} finally {
				setLoading(false)
			}
		}

		fetchOrders()
	}, [user, router])

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

	return (
		<main className='min-h-screen bg-gradient-to-b from-orange-50 to-white'>
			<Header />

			<div className='container mx-auto px-4 py-8 max-w-6xl'>
				<div className='flex items-center justify-between mb-8'>
					<div>
						<h1 className='text-3xl font-bold mb-2'>Mening buyurtmalarim</h1>
						<p className='text-gray-600'>
							Barcha buyurtmalaringizni bu yerda ko&apos;rishingiz mumkin
						</p>
					</div>
					<Button onClick={() => router.push('/')} className='bg-orange-600 hover:bg-orange-700'>
						<ShoppingBag className='w-4 h-4 mr-2' />
						Yangi buyurtma
					</Button>
				</div>

				{orders.length === 0 ? (
					<Card className='p-12'>
						<div className='text-center'>
							<Package className='w-16 h-16 mx-auto mb-4 text-gray-400' />
							<h2 className='text-2xl font-semibold mb-2'>Buyurtmalar yo&apos;q</h2>
							<p className='text-gray-600 mb-6'>Siz hali buyurtma bermagansiz</p>
							<Button
								onClick={() => router.push('/')}
								className='bg-orange-600 hover:bg-orange-700'
							>
								Buyurtma berish
							</Button>
						</div>
					</Card>
				) : (
					<div className='space-y-4'>
						{orders.map(order => {
							const status = statusConfig[order.status as keyof typeof statusConfig]
							return (
								<Card
									key={order.id}
									className='hover:shadow-lg transition-shadow cursor-pointer'
									onClick={() => router.push(`/orders/${order.id}`)}
								>
									<CardContent className='p-6'>
										<div className='flex items-start justify-between mb-4'>
											<div>
												<h3 className='text-xl font-bold mb-1'>Buyurtma {order.orderNumber}</h3>
												<p className='text-sm text-gray-600 flex items-center gap-2'>
													<Clock className='w-4 h-4' />
													{new Date(order.createdAt).toLocaleDateString('uz-UZ', {
														year: 'numeric',
														month: 'long',
														day: 'numeric',
														hour: '2-digit',
														minute: '2-digit',
													})}
												</p>
											</div>
											<Badge className={`${status.color} text-sm px-3 py-1`}>{status.label}</Badge>
										</div>

										<div className='flex items-center gap-4 mb-4'>
											{order.items.slice(0, 3).map(item => (
												<div
													key={item.id}
													className='relative w-16 h-16 rounded-lg overflow-hidden bg-white flex-shrink-0'
												>
													<Image
														src={item.product.imageUrl}
														alt={item.product.name}
														fill
														sizes='64px'
														className='object-cover'
													/>
												</div>
											))}
											{order.items.length > 3 && (
												<div className='text-sm text-gray-600'>+{order.items.length - 3} ta</div>
											)}
										</div>

										<div className='flex items-center justify-between pt-4 border-t'>
											<div className='text-sm text-gray-600'>{order.items.length} ta mahsulot</div>
											<div className='text-xl font-bold text-orange-600'>
												{order.totalPrice.toLocaleString()} so&apos;m
											</div>
										</div>
									</CardContent>
								</Card>
							)
						})}
					</div>
				)}
			</div>
		</main>
	)
}
