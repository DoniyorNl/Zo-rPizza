// frontend/app/admin/orders/page.tsx
'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/AuthContext'
import axios from 'axios'
import { format } from 'date-fns'
import { useEffect, useState } from 'react'

const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_URL || 'https://zo-rpizza-production.up.railway.app'

interface Order {
	id: string
	orderNumber: string
	status: string
	totalPrice: number
	deliveryAddress: string
	deliveryPhone: string
	createdAt: string
	user: {
		email: string
		name: string
	}
	items: Array<{
		quantity: number
		product: {
			name: string
		}
	}>
}

export default function AdminOrdersPage() {
	const { user } = useAuth()
	const [orders, setOrders] = useState<Order[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')

	useEffect(() => {
		if (!user) return

		const fetchOrders = async () => {
			try {
				const response = await axios.get(`${API_BASE_URL}/api/orders/admin/all`, {
					headers: {
						'x-user-id': user.uid,
					},
				})
				setOrders(response.data.data)
			} catch (err: unknown) {
				const message = axios.isAxiosError(err)
					? err.response?.data?.message || 'Xatolik yuz berdi'
					: 'Xatolik yuz berdi'
				setError(message)
			} finally {
				setLoading(false)
			}
		}

		fetchOrders()
	}, [user])

	const updateStatus = async (orderId: string, newStatus: string) => {
		try {
			await axios.patch(
				`${API_BASE_URL}/api/orders/admin/${orderId}/status`,
				{ status: newStatus },
				{
					headers: {
						'x-user-id': user?.uid,
					},
				},
			)

			// Update local state
			setOrders(
				orders.map(order => (order.id === orderId ? { ...order, status: newStatus } : order)),
			)
		} catch (err: unknown) {
			const message = axios.isAxiosError(err)
				? err.response?.data?.message || "Status o'zgartirib bo'lmadi"
				: "Status o'zgartirib bo'lmadi"
			alert(`Status o'zgartirib bo'lmadi: ${message}`)
		}
	}

	const getStatusBadge = (status: string) => {
		const config = {
			PENDING: { label: 'Kutilmoqda', color: 'bg-yellow-100 text-yellow-800' },
			PREPARING: { label: 'Tayyorlanmoqda', color: 'bg-blue-100 text-blue-800' },
			DELIVERING: { label: 'Yetkazilmoqda', color: 'bg-purple-100 text-purple-800' },
			COMPLETED: { label: 'Yetkazildi', color: 'bg-green-100 text-green-800' },
			CANCELLED: { label: 'Bekor qilindi', color: 'bg-red-100 text-red-800' },
		}
		const c = config[status as keyof typeof config] || config.PENDING
		return <Badge className={c.color}>{c.label}</Badge>
	}

	if (loading) {
		return <div className='text-center py-12'>Yuklanmoqda...</div>
	}

	if (error) {
		return <div className='text-center py-12 text-red-600'>{error}</div>
	}

	return (
		<div>
			<div className='mb-8'>
				<h1 className='text-3xl font-bold mb-2'>Buyurtmalar</h1>
				<p className='text-gray-600'>Jami: {orders.length} ta</p>
			</div>

			<div className='space-y-4'>
				{orders.map(order => (
					<Card key={order.id}>
						<CardHeader>
							<div className='flex justify-between items-start'>
								<div>
									<CardTitle className='text-xl mb-2'>Buyurtma {order.orderNumber}</CardTitle>
									<div className='space-y-1 text-sm text-gray-600'>
										<p>👤 {order.user.name || order.user.email}</p>
										<p>📅 {format(new Date(order.createdAt), 'dd.MM.yyyy HH:mm')}</p>
										<p>📦 {order.items.length} ta mahsulot</p>
									</div>
								</div>
								{getStatusBadge(order.status)}
							</div>
						</CardHeader>

						<CardContent>
							<div className='space-y-4'>
								{/* Products */}
								<div className='text-sm'>
									<p className='font-semibold mb-1'>Mahsulotlar:</p>
									{order.items.map((item, idx) => (
										<p key={idx} className='text-gray-600'>
											• {item.product.name} x{item.quantity}
										</p>
									))}
								</div>

								{/* Address */}
								<div className='text-sm'>
									<p className='font-semibold mb-1'>Manzil:</p>
									<p className='text-gray-600'>{order.deliveryAddress}</p>
									<p className='text-gray-600'>📞 {order.deliveryPhone}</p>
								</div>

								{/* Price */}
								<div className='flex justify-between items-center pt-4 border-t'>
									<span className='font-bold'>Jami:</span>
									<span className='text-xl font-bold text-orange-600'>
										{order.totalPrice.toLocaleString()} so&apos;m
									</span>
								</div>

								{/* Status Actions */}
								<div className='flex gap-2 flex-wrap'>
									{order.status === 'PENDING' && (
										<Button
											size='sm'
											onClick={() => updateStatus(order.id, 'PREPARING')}
											className='bg-blue-600 hover:bg-blue-700'
										>
											Tayyorlashni boshlash
										</Button>
									)}
									{order.status === 'PREPARING' && (
										<Button
											size='sm'
											onClick={() => updateStatus(order.id, 'DELIVERING')}
											className='bg-purple-600 hover:bg-purple-700'
										>
											Yetkazishga yuborish
										</Button>
									)}
									{order.status === 'DELIVERING' && (
										<Button
											size='sm'
											onClick={() => updateStatus(order.id, 'COMPLETED')}
											className='bg-green-600 hover:bg-green-700'
										>
											Yetkazildi
										</Button>
									)}
									{order.status !== 'CANCELLED' && order.status !== 'COMPLETED' && (
										<Button
											size='sm'
											variant='outline'
											onClick={() => updateStatus(order.id, 'CANCELLED')}
											className='border-red-600 text-red-600 hover:bg-red-50'
										>
											Bekor qilish
										</Button>
									)}
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	)
}
