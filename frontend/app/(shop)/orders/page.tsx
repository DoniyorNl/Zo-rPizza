// frontend/app/(shop)/orders/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import axios from 'axios'
import { format } from 'date-fns'
import { Clock, MapPin, Package } from 'lucide-react'

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
	paymentMethod: string
	deliveryAddress: string
	deliveryPhone: string
	createdAt: string
	items: OrderItem[]
}

export default function OrdersPage() {
	const { user } = useAuth()
	const router = useRouter()
	const [orders, setOrders] = useState<Order[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')

	useEffect(() => {
		if (!user) {
			router.push('/login')
			return
		}

		const fetchOrders = async () => {
			try {
				const response = await axios.get(`http://localhost:5001/api/orders/user/${user.uid}`)
				setOrders(response.data.data)
			} catch (err: any) {
				setError(err.response?.data?.message || "Buyurtmalarni yuklab bo'lmadi")
			} finally {
				setLoading(false)
			}
		}

		fetchOrders()
	}, [user, router])

	const getStatusBadge = (status: string) => {
		const statusConfig = {
			PENDING: { label: 'Kutilmoqda', color: 'bg-yellow-100 text-yellow-800' },
			PREPARING: { label: 'Tayyorlanmoqda', color: 'bg-blue-100 text-blue-800' },
			DELIVERING: { label: 'Yetkazilmoqda', color: 'bg-purple-100 text-purple-800' },
			COMPLETED: { label: 'Yetkazildi', color: 'bg-green-100 text-green-800' },
			CANCELLED: { label: 'Bekor qilindi', color: 'bg-red-100 text-red-800' },
		}

		const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
		return <Badge className={`${config.color} text-xs`}>{config.label}</Badge>
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

	if (error) {
		return (
			<main className='min-h-screen bg-gradient-to-b from-orange-50 to-white'>
				<Header />
				<div className='container mx-auto px-4 py-12'>
					<div className='text-center text-red-600 text-xl'>{error}</div>
				</div>
			</main>
		)
	}

	return (
		<main className='min-h-screen bg-gradient-to-b from-orange-50 to-white'>
			<Header />

			<div className='container mx-auto px-4 py-8'>
				<div className='flex items-center justify-between mb-8'>
					<h1 className='text-3xl font-bold'>Buyurtmalarim</h1>
					<Badge variant='outline' className='text-base'>
						{orders.length} ta buyurtma
					</Badge>
				</div>

				{orders.length === 0 ? (
					<div className='text-center py-20'>
						<Package className='w-16 h-16 mx-auto text-gray-400 mb-4' />
						<h2 className='text-2xl font-bold mb-2'>Hali buyurtmalar yo'q</h2>
						<p className='text-gray-600 mb-6'>Birinchi buyurtmangizni bering!</p>
						<Button onClick={() => router.push('/')}>Menyu'ga qaytish</Button>
					</div>
				) : (
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
						{orders.map(order => (
							<Card
								key={order.id}
								className='hover:shadow-xl transition-all cursor-pointer hover:scale-105'
								onClick={() => router.push(`/orders/${order.id}`)}
							>
								<CardHeader className='pb-3'>
									<div className='flex justify-between items-start mb-2'>
										<CardTitle className='text-lg'>№{order.orderNumber}</CardTitle>
										{getStatusBadge(order.status)}
									</div>
									<div className='flex items-center text-xs text-gray-500'>
										<Clock className='w-3 h-3 mr-1' />
										{format(new Date(order.createdAt), 'dd.MM.yyyy')}
									</div>
								</CardHeader>

								<CardContent className='space-y-3'>
									{/* Items count */}
									<div className='text-sm text-gray-600'>
										<Package className='w-4 h-4 inline mr-1' />
										{order.items.length} ta mahsulot
									</div>

									{/* Address */}
									<div className='text-sm text-gray-600 flex items-start gap-1'>
										<MapPin className='w-4 h-4 mt-0.5 flex-shrink-0' />
										<span className='line-clamp-2'>{order.deliveryAddress}</span>
									</div>

									{/* Total */}
									<div className='pt-3 border-t'>
										<div className='flex justify-between items-center'>
											<span className='text-sm font-medium'>Jami:</span>
											<span className='text-lg font-bold text-orange-600'>
												{order.totalPrice.toLocaleString()}
											</span>
										</div>
									</div>

									{/* View button */}
									<Button
										variant='outline'
										size='sm'
										className='w-full'
										onClick={e => {
											e.stopPropagation()
											router.push(`/orders/${order.id}`)
										}}
									>
										Batafsil
									</Button>
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</div>
		</main>
	)
}
