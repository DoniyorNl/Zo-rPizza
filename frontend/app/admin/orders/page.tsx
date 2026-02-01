// frontend/app/admin/orders/page.tsx
'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/lib/apiClient'
import { useAuth } from '@/lib/AuthContext'
import axios from 'axios'
import { format } from 'date-fns'
import { useEffect, useState } from 'react'

interface Order {
	id: string
	orderNumber: string
	status: string
	totalPrice: number
	deliveryAddress: string
	deliveryPhone: string
	deliveryLat?: number | null
	deliveryLng?: number | null
	driverId?: string | null
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

interface Driver {
	id: string
	name: string | null
	email: string
	phone: string | null
	isDriver: boolean
	vehicleType?: string | null
}

export default function AdminOrdersPage() {
	const { user } = useAuth()
	const [orders, setOrders] = useState<Order[]>([])
	const [drivers, setDrivers] = useState<Driver[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [simulatingOrderId, setSimulatingOrderId] = useState<string | null>(null)
	const [simulateLat, setSimulateLat] = useState('41.2995')
	const [simulateLng, setSimulateLng] = useState('69.2401')
	const [selectedDriverForOrder, setSelectedDriverForOrder] = useState<Record<string, string>>({})

	useEffect(() => {
		if (!user?.uid) {
			setLoading(false)
			return
		}

		const fetchOrders = async () => {
			try {
				const response = await api.get('/api/orders/admin/all', {
					headers: { 'x-user-id': user.uid },
				})
				setOrders(response.data.data)
			} catch (err: unknown) {
				const msg = axios.isAxiosError(err) ? err.response?.data?.message : null
				if (err && axios.isAxiosError(err) && err.response?.status === 401) {
					setError(
						msg ||
						"Kirish mumkin emas. Hisobingizda ADMIN huquqi bo'lishi kerak. Agar yangi ro'yxatdan o'tgan bo'lsangiz, administrator bilan bog'laning.",
					)
				} else {
					setError(msg || 'Xatolik yuz berdi')
				}
			} finally {
				setLoading(false)
			}
		}

		fetchOrders()
	}, [user])

	// Haydovchilar ro'yxati (driver assignment uchun)
	useEffect(() => {
		if (!user?.uid) return
		const fetchDrivers = async () => {
			try {
				const res = await api.get('/api/users', {
					params: { isDriver: 'true', limit: 50 },
					headers: { 'x-user-id': user.uid },
				})
				if (res.data.success && res.data.data?.users) {
					setDrivers(res.data.data.users)
				}
			} catch {
				setDrivers([])
			}
		}
		fetchDrivers()
	}, [user])

	const updateStatus = async (
		orderId: string,
		newStatus: string,
		driverId?: string,
		deliveryLat?: number,
		deliveryLng?: number
	) => {
		try {
			const payload: Record<string, unknown> = { status: newStatus }
			if (driverId) payload.driverId = driverId
			if (deliveryLat != null) payload.deliveryLat = deliveryLat
			if (deliveryLng != null) payload.deliveryLng = deliveryLng

			await api.patch(
				`/api/orders/admin/${orderId}/status`,
				payload,
				{ headers: { 'x-user-id': user?.uid } }
			)

			setOrders(orders.map(o => (o.id === orderId ? { ...o, status: newStatus, driverId } : o)))
		} catch (err: unknown) {
			const msg =
				axios.isAxiosError(err) ? err.response?.data?.message || "Status o'zgartirib bo'lmadi" : "Status o'zgartirib bo'lmadi"
			alert(`Status o'zgartirib bo'lmadi: ${msg}`)
		}
	}

	const simulateDriverLocation = async (orderId: string) => {
		try {
			const lat = parseFloat(simulateLat)
			const lng = parseFloat(simulateLng)
			if (isNaN(lat) || isNaN(lng)) {
				alert("Lat va Lng raqam bo'lishi kerak")
				return
			}
			setSimulatingOrderId(orderId)
			const token = await user?.getIdToken()
			await api.post(
				'/api/tracking/admin/simulate-location',
				{ orderId, lat, lng },
				{
					headers: {
						Authorization: `Bearer ${token}`,
						'x-user-id': user?.uid,
					},
				},
			)
			const res = await api.get('/api/orders/admin/all', {
				headers: { 'x-user-id': user?.uid },
			})
			if (res.data.success) setOrders(res.data.data)
		} catch (err: unknown) {
			const msg = axios.isAxiosError(err) ? err.response?.data?.message : 'Xatolik'
			alert(msg)
		} finally {
			setSimulatingOrderId(null)
		}
	}

	const getStatusBadge = (status: string) => {
		const config: Record<string, { label: string; color: string }> = {
			PENDING: { label: 'Kutilmoqda', color: 'bg-yellow-100 text-yellow-800' },
			PREPARING: { label: 'Tayyorlanmoqda', color: 'bg-blue-100 text-blue-800' },
			DELIVERING: { label: 'Yetkazilmoqda', color: 'bg-purple-100 text-purple-800' },
			OUT_FOR_DELIVERY: { label: 'Yetkazilmoqda', color: 'bg-purple-100 text-purple-800' },
			COMPLETED: { label: 'Yetkazildi', color: 'bg-green-100 text-green-800' },
			DELIVERED: { label: 'Yetkazildi', color: 'bg-green-100 text-green-800' },
			CANCELLED: { label: 'Bekor qilindi', color: 'bg-red-100 text-red-800' },
		}
		const c = config[status] || { label: status, color: 'bg-gray-100 text-gray-800' }
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
								<div className='flex flex-col gap-3'>
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
											<>
												{drivers.length > 0 && (
													<select
														className='rounded border px-2 py-1 text-sm'
														value={selectedDriverForOrder[order.id] || ''}
														onChange={e =>
															setSelectedDriverForOrder(prev => ({
																...prev,
																[order.id]: e.target.value,
															}))
														}
													>
														<option value=''>Haydovchisiz</option>
														{drivers.map(d => (
															<option key={d.id} value={d.id}>
																{d.name || d.email} {d.vehicleType ? `(${d.vehicleType})` : ''}
															</option>
														))}
													</select>
												)}
												<Button
													size='sm'
													onClick={() =>
														updateStatus(
															order.id,
															'OUT_FOR_DELIVERY',
															selectedDriverForOrder[order.id] || undefined
														)
													}
													className='bg-purple-600 hover:bg-purple-700'
												>
													Yetkazishga yuborish
												</Button>
											</>
										)}
										{(order.status === 'DELIVERING' || order.status === 'OUT_FOR_DELIVERY') && (
											<Button
												size='sm'
												onClick={() => updateStatus(order.id, 'DELIVERED')}
												className='bg-green-600 hover:bg-green-700'
											>
												Yetkazildi
											</Button>
										)}
										{order.status !== 'CANCELLED' &&
											order.status !== 'COMPLETED' &&
											order.status !== 'DELIVERED' && (
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
									{/* Haydovchi joyini simulyatsiya (test uchun) */}
									{(order.status === 'OUT_FOR_DELIVERY' || order.status === 'DELIVERING') && (
										<div className='flex flex-wrap items-center gap-2 rounded bg-gray-50 p-2 text-sm'>
											<span className='text-gray-600'>📍 Test: haydovchi joyi</span>
											<input
												type='number'
												step='0.0001'
												placeholder='Lat'
												value={simulateLat}
												onChange={e => setSimulateLat(e.target.value)}
												className='w-24 rounded border px-2 py-1'
											/>
											<input
												type='number'
												step='0.0001'
												placeholder='Lng'
												value={simulateLng}
												onChange={e => setSimulateLng(e.target.value)}
												className='w-24 rounded border px-2 py-1'
											/>
											<Button
												size='sm'
												variant='outline'
												disabled={simulatingOrderId === order.id}
												onClick={() => simulateDriverLocation(order.id)}
												className='text-xs'
											>
												{simulatingOrderId === order.id ? '...' : 'Yuborish'}
											</Button>
											<a
												href={`/tracking/${order.id}`}
												target='_blank'
												rel='noopener noreferrer'
												className='text-orange-600 hover:underline text-xs'
											>
												Xaritada ko'rish →
											</a>
										</div>
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
