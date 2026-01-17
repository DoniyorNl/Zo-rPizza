// frontend/app/(shop)/orders/[id]/page.tsx
// 📄 ORDER DETAILS PAGE

'use client'

import { Header } from '@/components/layout/Header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/AuthContext'
import { useCartStore } from '@/store/cartStore'
import axios from 'axios'
import { format } from 'date-fns'
import { ArrowLeft, CheckCircle2, Clock, CreditCard, MapPin, Package, Phone } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { use, useEffect, useState } from 'react'

interface OrderItem {
	id: string
	quantity: number
	price: number
	variationId?: string | null
	size?: string | null
	product: {
		id: string
		name: string
		description: string
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

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
	const { user } = useAuth()
	const router = useRouter()
	const { addItem } = useCartStore()
	const [order, setOrder] = useState<Order | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const { id } = use(params)

	useEffect(() => {
		if (!user) {
			router.push('/login')
			return
		}

		const fetchOrder = async () => {
			try {
				const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${id}`)
				setOrder(response.data.data)
			} catch (err: unknown) {
				if (axios.isAxiosError(err)) {
					setError(err.response?.data?.message || 'Buyurtma topilmadi')
				} else {
					setError('Buyurtma topilmadi')
				}
			} finally {
				setLoading(false)
			}
		}

		fetchOrder()
	}, [id, user, router])

	const getStatusConfig = (status: string) => {
		const config = {
			PENDING: {
				label: 'Kutilmoqda',
				color: 'bg-yellow-100 text-yellow-800',
				icon: Clock,
				description: 'Buyurtmangiz qabul qilindi',
			},
			PREPARING: {
				label: 'Tayyorlanmoqda',
				color: 'bg-blue-100 text-blue-800',
				icon: Package,
				description: 'Buyurtmangiz tayyorlanmoqda',
			},
			DELIVERING: {
				label: 'Yetkazilmoqda',
				color: 'bg-purple-100 text-purple-800',
				icon: Package,
				description: "Buyurtmangiz yo'lda",
			},
			COMPLETED: {
				label: 'Yetkazildi',
				color: 'bg-green-100 text-green-800',
				icon: CheckCircle2,
				description: 'Buyurtma yetkazildi!',
			},
			CANCELLED: {
				label: 'Bekor qilindi',
				color: 'bg-red-100 text-red-800',
				icon: Clock,
				description: 'Buyurtma bekor qilindi',
			},
		}
		return config[status as keyof typeof config] || config.PENDING
	}

	const handleReorder = () => {
		if (!order) return

		order.items.forEach(item => {
			addItem({
			productId: item.product.id,
			variationId: item.variationId || 'default',
				name: item.product.name,
			size: item.size || 'Standard',
				price: item.price,
				imageUrl: item.product.imageUrl,
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

	if (error || !order) {
		return (
			<main className='min-h-screen bg-gradient-to-b from-orange-50 to-white'>
				<Header />
				<div className='container mx-auto px-4 py-12'>
					<div className='text-center'>
						<div className='text-red-600 text-xl mb-4'>{error || 'Buyurtma topilmadi'}</div>
						<Button onClick={() => router.push('/orders')}>Buyurtmalarga qaytish</Button>
					</div>
				</div>
			</main>
		)
	}

	const statusConfig = getStatusConfig(order.status)
	const StatusIcon = statusConfig.icon

	return (
		<main className='min-h-screen bg-gradient-to-b from-orange-50 to-white'>
			<Header />

			<div className='container mx-auto px-4 py-8'>
				{/* Back button */}
				<Button variant='ghost' onClick={() => router.push('/orders')} className='mb-6'>
					<ArrowLeft className='w-4 h-4 mr-2' />
					Buyurtmalarga qaytish
				</Button>

				{/* Header */}
				<div className='flex items-center justify-between mb-8'>
					<div>
						<h1 className='text-3xl font-bold mb-2'>Buyurtma {order.orderNumber}</h1>
						<p className='text-gray-600'>
							{format(new Date(order.createdAt), 'dd MMMM yyyy, HH:mm')}
						</p>
					</div>
					<Badge className={`${statusConfig.color} text-base px-4 py-2`}>
						<StatusIcon className='w-4 h-4 mr-2' />
						{statusConfig.label}
					</Badge>
				</div>

				<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
					{/* Main content - Products */}
					<div className='lg:col-span-2 space-y-6'>
						{/* Status Timeline */}
						<Card>
							<CardHeader>
								<CardTitle>Buyurtma holati</CardTitle>
							</CardHeader>
							<CardContent>
								<div className='flex items-center gap-2 text-gray-700'>
									<StatusIcon className='w-5 h-5' />
									<span>{statusConfig.description}</span>
								</div>
							</CardContent>
						</Card>

						{/* Products */}
						<Card>
							<CardHeader>
								<CardTitle>Mahsulotlar ({order.items.length})</CardTitle>
							</CardHeader>
							<CardContent className='space-y-4'>
								{order.items.map(item => (
									<div
										key={item.id}
										className='flex gap-4 p-4 border rounded-lg hover:bg-gray-50 transition'
									>
										{/* Product Image */}
										<div className='relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden'>
											<Image
												src={item.product.imageUrl}
												alt={item.product.name}
												fill
												className='object-cover'
											/>
										</div>

										{/* Product Info */}
										<div className='flex-1'>
											<h3 className='font-semibold text-lg mb-1'>{item.product.name}</h3>
											<p className='text-sm text-gray-600 mb-2'>{item.product.description}</p>
											<div className='flex items-center justify-between'>
												<span className='text-sm text-gray-600'>Miqdor: {item.quantity} ta</span>
												<span className='font-semibold text-lg'>
													{(item.price * item.quantity).toLocaleString()} so&apos;m
												</span>
											</div>
										</div>
									</div>
								))}
							</CardContent>
						</Card>
					</div>

					{/* Sidebar - Order Summary */}
					<div className='space-y-6'>
						{/* Delivery Info */}
						<Card>
							<CardHeader>
								<CardTitle>Yetkazish ma&apos;lumotlari</CardTitle>
							</CardHeader>
							<CardContent className='space-y-4'>
								{/* Address */}
								<div className='flex items-start gap-3'>
									<MapPin className='w-5 h-5 text-gray-500 mt-1 flex-shrink-0' />
									<div>
										<p className='font-semibold text-sm mb-1'>Manzil:</p>
										<p className='text-gray-700'>{order.deliveryAddress}</p>
									</div>
								</div>

								{/* Phone */}
								<div className='flex items-start gap-3'>
									<Phone className='w-5 h-5 text-gray-500 mt-1 flex-shrink-0' />
									<div>
										<p className='font-semibold text-sm mb-1'>Telefon:</p>
										<p className='text-gray-700'>{order.deliveryPhone}</p>
									</div>
								</div>

								{/* Payment Method */}
								<div className='flex items-start gap-3'>
									<CreditCard className='w-5 h-5 text-gray-500 mt-1 flex-shrink-0' />
									<div>
										<p className='font-semibold text-sm mb-1'>To&apos;lov usuli:</p>
										<p className='text-gray-700'>
											{order.paymentMethod === 'CASH' ? '💵 Naqd pul' : '💳 Karta'}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Total */}
						<Card>
							<CardHeader>
								<CardTitle>Jami summa</CardTitle>
							</CardHeader>
							<CardContent className='space-y-3'>
								<div className='flex justify-between text-sm'>
									<span className='text-gray-600'>Mahsulotlar:</span>
									<span className='font-semibold'>{order.totalPrice.toLocaleString()} so&apos;m</span>
								</div>
								<div className='flex justify-between text-sm'>
									<span className='text-gray-600'>Yetkazish:</span>
									<span className='text-green-600 font-semibold'>Bepul</span>
								</div>
								<div className='border-t pt-3'>
									<div className='flex justify-between'>
										<span className='text-lg font-bold'>Jami:</span>
										<span className='text-2xl font-bold text-orange-600'>
											{order.totalPrice.toLocaleString()} so&apos;m
										</span>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Actions */}
						{order.status === 'COMPLETED' && (
							<Button onClick={handleReorder} className='w-full' size='lg'>
								Qayta buyurtma berish
							</Button>
						)}
					</div>
				</div>
			</div>
		</main>
	)
}
