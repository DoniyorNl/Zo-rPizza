// frontend/app/(shop)/tracking/[id]/page.tsx
'use client'

import TrackingMap from '@/components/tracking/TrackingMap'
import { useAuth } from '@/lib/AuthContext'
import { buildApiUrl } from '@/lib/apiBaseUrl'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Location {
	lat: number
	lng: number
	timestamp?: string
}

interface TrackingData {
	driverLocation: Location
	deliveryLocation: Location
	distance: number
	eta: number
	isNearby: boolean
	lastUpdate: string
}

interface Driver {
	id: string
	name: string
	phone: string
	vehicleType: string
}

interface OrderData {
	id: string
	status: string
	totalAmount?: number
	totalPrice?: number
	deliveryAddress: string
	createdAt: string
	trackingStartedAt?: string
	deliveryStartedAt?: string
	deliveryCompletedAt?: string
}

interface TrackingResponse {
	order: OrderData
	tracking: TrackingData | null
	driver: Driver | null
}

export default function OrderTrackingPage() {
	const params = useParams()
	const router = useRouter()
	const { user } = useAuth()
	const orderId = params?.id as string

	const [trackingData, setTrackingData] = useState<TrackingResponse | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const fetchTracking = async () => {
		try {
			const token = await user?.getIdToken()
			const response = await fetch(
				buildApiUrl(`/api/tracking/order/${orderId}`),
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			)

			if (!response.ok) {
				throw new Error('Failed to fetch tracking data')
			}

			const result = await response.json()
			setTrackingData(result.data)
			setError(null)
		} catch (err) {
			console.error('Tracking error:', err)
			setError('Failed to load tracking information')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		if (user && orderId) {
			fetchTracking()
		}
	}, [user, orderId])

	useEffect(() => {
		if (
			['OUT_FOR_DELIVERY', 'DELIVERING', 'PREPARING'].includes(
				trackingData?.order.status || ''
			)
		) {
			const interval = setInterval(fetchTracking, 10000)
			return () => clearInterval(interval)
		}
	}, [trackingData?.order.status])

	const getStatusColor = (status: string) => {
		const colors: Record<string, string> = {
			PENDING: 'bg-yellow-100 text-yellow-800',
			CONFIRMED: 'bg-blue-100 text-blue-800',
			PREPARING: 'bg-purple-100 text-purple-800',
			OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-800',
			DELIVERED: 'bg-green-100 text-green-800',
			CANCELLED: 'bg-red-100 text-red-800',
		}
		return colors[status] || 'bg-gray-100 text-gray-800'
	}

	const formatETA = (minutes: number) => {
		if (minutes < 60) return `${minutes} min`
		const hours = Math.floor(minutes / 60)
		const mins = minutes % 60
		return `${hours}h ${mins}min`
	}

	if (loading) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4'></div>
					<p className='text-gray-600'>Loading tracking information...</p>
				</div>
			</div>
		)
	}

	if (error || !trackingData) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<div className='text-center'>
					<div className='text-6xl mb-4'>❌</div>
					<h2 className='text-2xl font-bold text-gray-800 mb-2'>Unable to Load Tracking</h2>
					<p className='text-gray-600 mb-6'>{error}</p>
					<button
						onClick={() => router.push('/orders')}
						className='px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600'
					>
						Back to Orders
					</button>
				</div>
			</div>
		)
	}

	const { order, tracking, driver } = trackingData

	return (
		<div className='min-h-screen bg-gray-50 py-8'>
			<div className='max-w-6xl mx-auto px-4'>
				<div className='mb-6'>
					<button
						onClick={() => router.push('/orders')}
						className='flex items-center text-gray-600 hover:text-gray-800 mb-4'
					>
						<span className='mr-2'>←</span>
						Back to Orders
					</button>
					<h1 className='text-3xl font-bold text-gray-800'>Order Tracking</h1>
					<p className='text-gray-600'>Order #{order.id.slice(0, 8)}</p>
				</div>

				<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
					<div className='lg:col-span-2'>
						<div className='bg-white rounded-xl shadow-lg p-6'>
							<h2 className='text-xl font-bold text-gray-800 mb-4'>Live Tracking</h2>

							{tracking && tracking.driverLocation ? (
								<>
									<TrackingMap
										deliveryLocation={tracking.deliveryLocation}
										driverLocation={tracking.driverLocation}
										height='500px'
										showRoute
									/>

									{/* Stats Grid */}
									<div className='grid grid-cols-3 gap-4 mt-6'>
										<div className='text-center p-4 bg-blue-50 rounded-lg'>
											<div className='text-2xl font-bold text-blue-600'>
												{tracking.distance.toFixed(1)} km
											</div>
											<div className='text-sm text-gray-600'>Masofa</div>
										</div>
										<div className='text-center p-4 bg-orange-50 rounded-lg'>
											<div className='text-2xl font-bold text-orange-600'>
												{formatETA(tracking.eta)}
											</div>
											<div className='text-sm text-gray-600'>Taxminiy vaqt</div>
										</div>
										<div className='text-center p-4 bg-green-50 rounded-lg'>
											<div className='text-2xl font-bold text-green-600'>
												{tracking.isNearby ? '✓' : '○'}
											</div>
											<div className='text-sm text-gray-600'>Yaqinlashdi</div>
										</div>
									</div>

									{/* ETA Progress Bar */}
									<div className='mt-6 p-6 bg-gradient-to-r from-orange-50 to-pink-50 rounded-lg'>
										<div className='flex items-center justify-between mb-3'>
											<h3 className='text-lg font-bold text-gray-800'>Yetkazib berish jarayoni</h3>
											<span className='text-sm font-semibold text-orange-600'>
												{formatETA(tracking.eta)} qoldi
											</span>
										</div>

										{/* Progress Bar */}
										<div className='relative h-4 bg-gray-200 rounded-full overflow-hidden'>
											<div
												className='absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 to-pink-500 transition-all duration-500 rounded-full'
												style={{
													width: `${Math.min(100, Math.max(0, 100 - (tracking.distance * 10)))}%`
												}}
											>
												<div className='absolute inset-0 bg-white/20 animate-pulse'></div>
											</div>
										</div>

										{/* Timeline */}
										<div className='flex justify-between mt-4 text-xs text-gray-600'>
											<div className='flex flex-col items-center'>
												<div className='w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white mb-1'>
													✓
												</div>
												<span>Boshlandi</span>
											</div>
											<div className='flex flex-col items-center'>
												<div className={`w-8 h-8 rounded-full flex items-center justify-center text-white mb-1 ${tracking.distance < 5 ? 'bg-orange-500 animate-bounce' : 'bg-gray-300'
													}`}>
													🏍️
												</div>
												<span>Yo'lda</span>
											</div>
											<div className='flex flex-col items-center'>
												<div className={`w-8 h-8 rounded-full flex items-center justify-center text-white mb-1 ${tracking.isNearby ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
													}`}>
													{tracking.isNearby ? '✓' : '○'}
												</div>
												<span>Yaqinlashdi</span>
											</div>
											<div className='flex flex-col items-center'>
												<div className='w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white mb-1'>
													🏠
												</div>
												<span>Yetkazildi</span>
											</div>
										</div>
									</div>
								</>
							) : (
								<div className='h-[500px] bg-gray-100 rounded-lg flex items-center justify-center'>
									<div className='text-center'>
										<div className='text-6xl mb-4'>📍</div>
										<p className='text-gray-600'>Tracking will start when driver begins delivery</p>
									</div>
								</div>
							)}
						</div>
					</div>

					<div className='space-y-6'>
						<div className='bg-white rounded-xl shadow-lg p-6'>
							<h3 className='text-lg font-bold text-gray-800 mb-4'>Order Status</h3>
							<div className='space-y-4'>
								<span
									className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
										order.status,
									)}`}
								>
									{order.status.replace('_', ' ')}
								</span>

								<div className='space-y-3 mt-6'>
									<div className='flex items-start'>
										<div
											className={`w-8 h-8 rounded-full flex items-center justify-center ${order.status !== 'PENDING' ? 'bg-green-500' : 'bg-gray-300'
												}`}
										>
											<span className='text-white'>✓</span>
										</div>
										<div className='ml-4'>
											<div className='font-semibold'>Order Placed</div>
											<div className='text-sm text-gray-600'>
												{new Date(order.createdAt).toLocaleString()}
											</div>
										</div>
									</div>

									<div className='flex items-start'>
										<div
											className={`w-8 h-8 rounded-full flex items-center justify-center ${['PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status)
													? 'bg-green-500'
													: 'bg-gray-300'
												}`}
										>
											<span className='text-white'>✓</span>
										</div>
										<div className='ml-4'>
											<div className='font-semibold'>Preparing</div>
											<div className='text-sm text-gray-600'>
												{order.trackingStartedAt
													? new Date(order.trackingStartedAt).toLocaleString()
													: 'Waiting...'}
											</div>
										</div>
									</div>

									<div className='flex items-start'>
										<div
											className={`w-8 h-8 rounded-full flex items-center justify-center ${['OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status)
													? 'bg-green-500'
													: 'bg-gray-300'
												}`}
										>
											<span className='text-white'>✓</span>
										</div>
										<div className='ml-4'>
											<div className='font-semibold'>Out for Delivery</div>
											<div className='text-sm text-gray-600'>
												{order.deliveryStartedAt
													? new Date(order.deliveryStartedAt).toLocaleString()
													: 'Waiting...'}
											</div>
										</div>
									</div>

									<div className='flex items-start'>
										<div
											className={`w-8 h-8 rounded-full flex items-center justify-center ${order.status === 'DELIVERED' ? 'bg-green-500' : 'bg-gray-300'
												}`}
										>
											<span className='text-white'>✓</span>
										</div>
										<div className='ml-4'>
											<div className='font-semibold'>Delivered</div>
											<div className='text-sm text-gray-600'>
												{order.deliveryCompletedAt
													? new Date(order.deliveryCompletedAt).toLocaleString()
													: 'Waiting...'}
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>

						{driver && (
							<div className='bg-white rounded-xl shadow-lg p-6'>
								<h3 className='text-lg font-bold text-gray-800 mb-4'>Delivery Driver</h3>
								<div className='flex items-center mb-4'>
									<div className='w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-3xl'>
										👤
									</div>
									<div className='ml-4'>
										<div className='font-semibold text-gray-800'>{driver.name}</div>
										<div className='text-sm text-gray-600'>{driver.phone}</div>
										<div className='text-sm text-gray-600'>{driver.vehicleType || 'Bike'}</div>
									</div>
								</div>
								<button className='w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600'>
									Call Driver
								</button>
							</div>
						)}

						<div className='bg-white rounded-xl shadow-lg p-6'>
							<h3 className='text-lg font-bold text-gray-800 mb-4'>Delivery Address</h3>
							<p className='text-gray-700'>{order.deliveryAddress}</p>
						</div>

						<div className='bg-white rounded-xl shadow-lg p-6'>
							<h3 className='text-lg font-bold text-gray-800 mb-4'>Order Total</h3>
							<div className='text-3xl font-bold text-orange-600'>
								{(order.totalPrice ?? order.totalAmount ?? 0).toLocaleString()} so&apos;m
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
