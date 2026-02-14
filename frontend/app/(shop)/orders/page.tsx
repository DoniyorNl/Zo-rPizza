// frontend/app/(shop)/orders/page.tsx
// 🍕 ZOR PIZZA - ORDERS LIST PAGE

'use client'

import { Header } from '@/components/layout/Header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { api } from '@/lib/apiClient'
import { useAuth } from '@/lib/AuthContext'
import TrackingModal from '@/components/tracking/TrackingModal'
import { Clock, MapPin, Package, RotateCcw, ShoppingBag, Trash2 } from 'lucide-react'
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

const statusConfig: Record<string, { label: string; color: string }> = {
	PENDING: { label: 'Kutilmoqda', color: 'bg-yellow-100 text-yellow-800' },
	CONFIRMED: { label: 'Tasdiqlandi', color: 'bg-blue-100 text-blue-800' },
	PREPARING: { label: 'Tayyorlanmoqda', color: 'bg-blue-100 text-blue-800' },
	READY: { label: 'Tayyor', color: 'bg-indigo-100 text-indigo-800' },
	OUT_FOR_DELIVERY: { label: 'Yetkazilmoqda', color: 'bg-purple-100 text-purple-800' },
	DELIVERING: { label: 'Yetkazilmoqda', color: 'bg-purple-100 text-purple-800' },
	DELIVERED: { label: 'Yetkazildi', color: 'bg-green-100 text-green-800' },
	COMPLETED: { label: 'Yetkazildi', color: 'bg-green-100 text-green-800' },
	CANCELLED: { label: 'Bekor qilindi', color: 'bg-red-100 text-red-800' },
}

export default function OrdersPage() {
	const { user } = useAuth()
	const router = useRouter()
	const [orders, setOrders] = useState<Order[]>([])
	const [loading, setLoading] = useState(true)
	const [deletingId, setDeletingId] = useState<string | null>(null)
	const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null)
	const [trackingOrderNumber, setTrackingOrderNumber] = useState<string>('')
	const [reorderingId, setReorderingId] = useState<string | null>(null)

	const fetchOrders = async () => {
		if (!user) return
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

	useEffect(() => {
		if (!user) {
			router.push('/login')
			return
		}
		setLoading(true)
		fetchOrders()
	}, [user, router])

	const handleReorder = async (e: React.MouseEvent, orderId: string) => {
		e.stopPropagation()
		setReorderingId(orderId)
		try {
			const res = await api.post(`/api/orders/${orderId}/reorder`)
			if (res.data?.data?.id) {
				router.push(`/orders/${res.data.data.id}`)
			} else {
				router.push('/orders')
			}
		} catch (err: unknown) {
			const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
			alert(msg || 'Qayta buyurtmada xato')
		} finally {
			setReorderingId(null)
		}
	}

	const handleDelete = async (e: React.MouseEvent, orderId: string) => {
		e.stopPropagation()
		if (!confirm('Buyurtmani bekor qilmoqchimisiz?')) return
		setDeletingId(orderId)
		try {
			await api.delete(`/api/orders/${orderId}`)
			setOrders(prev => prev.filter(o => o.id !== orderId))
		} catch (err: unknown) {
			const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
			alert(msg || 'Bekor qilishda xato')
		} finally {
			setDeletingId(null)
		}
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
							const status = statusConfig[order.status] ?? {
								label: order.status,
								color: 'bg-gray-100 text-gray-800',
							}
							const canDelete = order.status === 'PENDING'
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
											<div className='flex items-center gap-2'>
												<Button
													variant='outline'
													size='sm'
													className='text-orange-600 hover:text-orange-700 hover:bg-orange-50'
													onClick={e => {
														e.stopPropagation()
														setTrackingOrderNumber(order.orderNumber)
														setTrackingOrderId(order.id)
													}}
													aria-label='Kuzatish'
												>
													<MapPin className='w-4 h-4 mr-1' />
													Kuzatish
												</Button>
												<Button
													variant='outline'
													size='sm'
													className='text-green-600 hover:text-green-700 hover:bg-green-50'
													onClick={e => handleReorder(e, order.id)}
													disabled={reorderingId === order.id}
													aria-label='Qayta buyurtma'
												>
													<RotateCcw className='w-4 h-4 mr-1' />
													Qayta buyurtma
												</Button>
												<Badge className={`${status.color} text-sm px-3 py-1`}>{status.label}</Badge>
												{canDelete && (
													<Button
														variant='outline'
														size='icon'
														className='text-red-600 hover:text-red-700 hover:bg-red-50'
														onClick={e => handleDelete(e, order.id)}
														disabled={deletingId === order.id}
														aria-label='Buyurtmani bekor qilish'
													>
														<Trash2 className='w-4 h-4' />
													</Button>
												)}
											</div>
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

			{trackingOrderId && (
				<TrackingModal
					open={!!trackingOrderId}
					onClose={() => {
						setTrackingOrderId(null)
						setTrackingOrderNumber('')
					}}
					orderId={trackingOrderId}
					orderNumber={trackingOrderNumber}
				/>
			)}
		</main>
	)
}
