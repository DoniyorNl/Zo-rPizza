/**
 * 🚗📍 DELIVERY TRACKER PAGE
 * Driver uchun GPS tracking interface
 *
 * Features:
 * - Start/Stop GPS tracking
 * - Real-time location updates har 5 sekundda
 * - Map view (TrackingMap component)
 * - Complete delivery button
 * - Customer info
 */

'use client'

import TrackingMap from '@/components/tracking/TrackingMap'
import { useGPSTracking } from '@/hooks/useGPSTracking'
import { buildApiUrl } from '@/lib/apiBaseUrl'
import { useAuth } from '@/lib/AuthContext'
import {
	AlertCircle,
	ArrowLeft,
	CheckCircle,
	Clock,
	MapPin,
	Navigation,
	Package,
	Phone,
	Play,
	Square,
	User,
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

interface Order {
	id: string
	orderNumber: string
	status: string
	totalPrice: number
	deliveryAddress: string
	customerPhone: string
	deliveryLocation?: { lat: number; lng: number }
	driverLocation?: { lat: number; lng: number }
	user: {
		name: string
		phone: string
	}
}

export default function DeliveryTrackerPage() {
	const params = useParams()
	const router = useRouter()
	const { user } = useAuth()
	const orderId = params.id as string

	const [order, setOrder] = useState<Order | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [isDeliveryStarted, setIsDeliveryStarted] = useState(false)
	const [isUpdatingLocation, setIsUpdatingLocation] = useState(false)

	// GPS Tracking Hook
	const {
		location,
		error: gpsError,
		isTracking,
		isSupported,
		permission,
		startTracking,
		stopTracking,
		requestPermission,
	} = useGPSTracking({
		enableHighAccuracy: true,
		updateInterval: 5000, // 5 sekund
		autoStart: false,
	})

	// Fetch order details
	useEffect(() => {
		fetchOrderDetails()
	}, [orderId])

	async function fetchOrderDetails() {
		try {
			const token = localStorage.getItem('firebaseToken')
			if (!token) throw new Error('Token topilmadi')

			const response = await fetch(buildApiUrl(`/api/orders/${orderId}`), {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})

			if (!response.ok) throw new Error('Buyurtma topilmadi')

			const data = await response.json()
			if (data.success) {
				setOrder(data.data)

				// Check if delivery already started
				if (data.data.status === 'OUT_FOR_DELIVERY') {
					setIsDeliveryStarted(true)
				}
			}
		} catch (err) {
			console.error('Fetch order error:', err)
			setError(err instanceof Error ? err.message : 'Xatolik yuz berdi')
		} finally {
			setLoading(false)
		}
	}

	// Update driver location to backend
	const updateDriverLocation = useCallback(
		async (lat: number, lng: number) => {
			if (isUpdatingLocation) return // Prevent multiple simultaneous requests

			try {
				setIsUpdatingLocation(true)
				const token = localStorage.getItem('firebaseToken')
				if (!token) throw new Error('Token topilmadi')

				const response = await fetch(buildApiUrl('/api/tracking/update-location'), {
					method: 'POST',
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ lat, lng }),
				})

				if (!response.ok) {
					throw new Error("Lokatsiyani yangilab bo'lmadi")
				}

				const data = await response.json()
				console.log('Location updated:', data)
			} catch (err) {
				console.error('Update location error:', err)
			} finally {
				setIsUpdatingLocation(false)
			}
		},
		[isUpdatingLocation],
	)

	// Send location to backend when GPS updates
	useEffect(() => {
		if (location && isDeliveryStarted && isTracking) {
			updateDriverLocation(location.lat, location.lng)
		}
	}, [location, isDeliveryStarted, isTracking, updateDriverLocation])

	// Start delivery
	async function handleStartDelivery() {
		try {
			// 1. Request GPS permission
			const granted = await requestPermission()
			if (!granted) {
				alert('GPS ruxsati kerak! Sozlamalarda yoqing.')
				return
			}

			// 2. Start delivery on backend
			const token = localStorage.getItem('firebaseToken')
			if (!token) throw new Error('Token topilmadi')

			// Get current location first
			const currentPos = await new Promise<GeolocationPosition>((resolve, reject) => {
				navigator.geolocation.getCurrentPosition(resolve, reject, {
					enableHighAccuracy: true,
					timeout: 10000,
					maximumAge: 0,
				})
			})

			const deliveryLocation = {
				lat: currentPos.coords.latitude,
				lng: currentPos.coords.longitude,
			}

			const response = await fetch(buildApiUrl(`/api/tracking/order/${orderId}/start`), {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ deliveryLocation }),
			})

			if (!response.ok) throw new Error("Deliveryni boshlab bo'lmadi")

			// 3. Start GPS tracking
			startTracking()
			setIsDeliveryStarted(true)

			// 4. Refresh order
			await fetchOrderDetails()

			alert('✅ Delivery boshlandi! GPS tracking faol.')
		} catch (err) {
			console.error('Start delivery error:', err)
			alert('❌ Xatolik: ' + (err instanceof Error ? err.message : 'Unknown'))
		}
	}

	// Complete delivery
	async function handleCompleteDelivery() {
		if (!confirm('Deliveryni yakunlaysizmi?')) return

		try {
			const token = localStorage.getItem('firebaseToken')
			if (!token) throw new Error('Token topilmadi')

			const response = await fetch(buildApiUrl(`/api/tracking/order/${orderId}/complete`), {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})

			if (!response.ok) throw new Error("Deliveryni yakunlab bo'lmadi")

			// Stop GPS tracking
			stopTracking()
			setIsDeliveryStarted(false)

			alert('✅ Delivery yakunlandi!')
			router.push('/driver/dashboard')
		} catch (err) {
			console.error('Complete delivery error:', err)
			alert('❌ Xatolik: ' + (err instanceof Error ? err.message : 'Unknown'))
		}
	}

	// Loading state
	if (loading) {
		return (
			<div className='flex items-center justify-center py-20'>
				<div className='animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600'></div>
			</div>
		)
	}

	// Error state
	if (error || !order) {
		return (
			<div className='flex items-center justify-center py-20'>
				<div className='text-center'>
					<AlertCircle className='w-12 h-12 text-red-500 mx-auto' />
					<p className='mt-4 text-red-600 font-medium'>{error || 'Buyurtma topilmadi'}</p>
					<Link
						href='/driver/dashboard'
						className='mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg'
					>
						Orqaga
					</Link>
				</div>
			</div>
		)
	}

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex items-center justify-between'>
				<Link
					href='/driver/dashboard'
					className='flex items-center space-x-2 text-gray-600 hover:text-gray-900'
				>
					<ArrowLeft className='w-5 h-5' />
					<span>Dashboard</span>
				</Link>
				<h1 className='text-2xl font-bold text-gray-900'>Buyurtma #{order.orderNumber}</h1>
			</div>

			{/* GPS Status Banner */}
			{!isSupported ? (
				<div className='bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3'>
					<AlertCircle className='w-6 h-6 text-red-600 flex-shrink-0 mt-0.5' />
					<div>
						<h3 className='font-semibold text-red-900'>GPS qo&apos;llab-quvvatlanmaydi</h3>
						<p className='text-sm text-red-700'>Bu qurilmada GPS mavjud emas</p>
					</div>
				</div>
			) : gpsError ? (
				<div className='bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3'>
					<AlertCircle className='w-6 h-6 text-red-600 flex-shrink-0 mt-0.5' />
					<div>
						<h3 className='font-semibold text-red-900'>GPS Xatosi</h3>
						<p className='text-sm text-red-700'>{gpsError.message}</p>
					</div>
				</div>
			) : isTracking ? (
				<div className='bg-green-50 border border-green-200 rounded-xl p-4 flex items-start space-x-3'>
					<div className='w-3 h-3 bg-green-500 rounded-full animate-pulse mt-2'></div>
					<div className='flex-1'>
						<h3 className='font-semibold text-green-900'>GPS Tracking Faol</h3>
						<p className='text-sm text-green-700'>
							Lokatsiya har 5 sekundda yangilanmoqda
							{location && ` • Aniqlik: ±${Math.round(location.accuracy || 0)}m`}
						</p>
					</div>
				</div>
			) : null}

			{/* Order Details Card */}
			<div className='bg-white rounded-2xl shadow-lg p-6 border border-gray-200'>
				<div className='flex items-center justify-between mb-6'>
					<h2 className='text-xl font-bold text-gray-900 flex items-center'>
						<Package className='w-6 h-6 text-blue-600 mr-2' />
						Buyurtma ma&apos;lumotlari
					</h2>
					<span className='px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold'>
						{order.status}
					</span>
				</div>

				<div className='grid md:grid-cols-2 gap-6'>
					{/* Customer Info */}
					<div className='space-y-4'>
						<div className='flex items-center space-x-3'>
							<User className='w-5 h-5 text-gray-400' />
							<div>
								<p className='text-sm text-gray-500'>Mijoz</p>
								<p className='font-semibold text-gray-900'>{order.user.name}</p>
							</div>
						</div>

						<div className='flex items-center space-x-3'>
							<Phone className='w-5 h-5 text-gray-400' />
							<div>
								<p className='text-sm text-gray-500'>Telefon</p>
								<a
									href={`tel:${order.user.phone}`}
									className='font-semibold text-blue-600 hover:underline'
								>
									{order.user.phone}
								</a>
							</div>
						</div>

						<div className='flex items-start space-x-3'>
							<MapPin className='w-5 h-5 text-gray-400 mt-1' />
							<div>
								<p className='text-sm text-gray-500'>Manzil</p>
								<p className='font-semibold text-gray-900'>{order.deliveryAddress}</p>
							</div>
						</div>
					</div>

					{/* Order Stats */}
					<div className='space-y-4'>
						<div className='flex items-center space-x-3'>
							<Package className='w-5 h-5 text-gray-400' />
							<div>
								<p className='text-sm text-gray-500'>Buyurtma raqami</p>
								<p className='font-semibold text-gray-900'>#{order.orderNumber}</p>
							</div>
						</div>

						<div className='flex items-center space-x-3'>
							<Clock className='w-5 h-5 text-gray-400' />
							<div>
								<p className='text-sm text-gray-500'>Summa</p>
								<p className='text-2xl font-bold text-gray-900'>
									{order.totalPrice.toLocaleString()} so&apos;m
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Map */}
			{isDeliveryStarted && order.deliveryLocation && (
				<div className='bg-white rounded-2xl shadow-lg p-4 border border-gray-200'>
					<h2 className='text-xl font-bold text-gray-900 mb-4 flex items-center'>
						<Navigation className='w-6 h-6 text-blue-600 mr-2' />
						GPS Xarita
					</h2>
					<TrackingMap
						driverLocation={
							location ? { lat: location.lat, lng: location.lng } : order.driverLocation
						}
						deliveryLocation={order.deliveryLocation}
					/>
				</div>
			)}

			{/* Action Buttons */}
			<div className='grid md:grid-cols-2 gap-4'>
				{!isDeliveryStarted ? (
					<>
						<button
							onClick={handleStartDelivery}
							disabled={!isSupported}
							className='flex items-center justify-center space-x-3 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed'
						>
							<Play className='w-6 h-6' />
							<span>Deliveryni Boshlash</span>
						</button>
						<Link
							href='/driver/dashboard'
							className='flex items-center justify-center space-x-3 py-4 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all'
						>
							<ArrowLeft className='w-6 h-6' />
							<span>Bekor qilish</span>
						</Link>
					</>
				) : (
					<>
						<button
							onClick={handleCompleteDelivery}
							className='flex items-center justify-center space-x-3 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all'
						>
							<CheckCircle className='w-6 h-6' />
							<span>Deliveryni Yakunlash</span>
						</button>
						<button
							onClick={stopTracking}
							className='flex items-center justify-center space-x-3 py-4 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all'
						>
							<Square className='w-6 h-6' />
							<span>GPS Stop</span>
						</button>
					</>
				)}
			</div>
		</div>
	)
}
