'use client'

/**
 * Enhanced Tracking Modal Component
 * Displays order tracking information with real-time updates and improved UI
 * @module TrackingModal
 */

import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/AuthContext'
import { buildApiUrl } from '@/lib/apiBaseUrl'
import {
	Map,
	X,
	Clock,
	MapPin,
	Truck,
	Phone,
	Navigation,
	Package,
	AlertCircle,
	CheckCircle,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import type {
	TrackingResponse,
	OrderStatus,
} from '@/types/tracking.types'
import { ORDER_STATUS_LABELS } from '@/types/tracking.types'

interface TrackingModalProps {
	open: boolean
	onClose: () => void
	orderId: string
	orderNumber?: string
}

/**
 * TrackingModal Component
 * Displays order tracking with driver location, ETA, and delivery status
 */
export default function TrackingModal({
	open,
	onClose,
	orderId,
	orderNumber = '',
}: TrackingModalProps) {
	const { user } = useAuth()
	const router = useRouter()
	const [response, setResponse] = useState<TrackingResponse | null>(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	// Fetch tracking data
	const fetchTrackingData = useCallback(async () => {
		if (!user || !orderId) return

		setLoading(true)
		setError(null)

		try {
			const token = await user.getIdToken()
			const res = await fetch(buildApiUrl(`/api/tracking/order/${orderId}`), {
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
			})

			if (!res.ok) {
				throw new Error(`Server responded with status ${res.status}`)
			}

			const json: TrackingResponse = await res.json()
			setResponse(json)
		} catch (err) {
			console.error('Tracking fetch error:', err)
			setError("Kuzatish ma'lumotini yuklashda xatolik yuz berdi")
		} finally {
			setLoading(false)
		}
	}, [user, orderId])

	// Load data when modal opens
	useEffect(() => {
		if (!open) {
			setResponse(null)
			setError(null)
			return
		}

		fetchTrackingData()
	}, [open, fetchTrackingData])

	// Format ETA time
	const formatETA = useCallback((minutes: number): string => {
		if (minutes < 1) return 'Deyarli yetib keldi'
		if (minutes < 60) return `${Math.round(minutes)} daqiqa`
		const hours = Math.floor(minutes / 60)
		const mins = Math.round(minutes % 60)
		return `${hours} soat ${mins} daqiqa`
	}, [])

	// Navigate to full map view
	const handleViewOnMap = useCallback(() => {
		onClose()
		router.push(`/tracking/${orderId}`)
	}, [onClose, router, orderId])

	// Get order status badge color
	const getStatusColor = (status: OrderStatus): string => {
		const colors: Record<OrderStatus, string> = {
			PENDING: 'bg-gray-100 text-gray-700 border-gray-300',
			CONFIRMED: 'bg-blue-100 text-blue-700 border-blue-300',
			PREPARING: 'bg-yellow-100 text-yellow-700 border-yellow-300',
			OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-700 border-orange-300',
			DELIVERING: 'bg-orange-100 text-orange-700 border-orange-300',
			DELIVERED: 'bg-green-100 text-green-700 border-green-300',
			CANCELLED: 'bg-red-100 text-red-700 border-red-300',
		}
		return colors[status] || 'bg-gray-100 text-gray-700 border-gray-300'
	}

	if (!open) return null

	const data = response?.data
	const order = data?.order
	const tracking = data?.tracking
	const driver = data?.driver

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
			onClick={onClose}
			role="dialog"
			aria-modal="true"
			aria-labelledby="tracking-modal-title"
		>
			<div
				className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
				onClick={e => e.stopPropagation()}
			>
				{/* Header */}
				<div className="sticky top-0 bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-t-2xl">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-3">
							<Package className="w-6 h-6" />
							<h3 id="tracking-modal-title" className="font-bold text-xl">
								Buyurtma #{orderNumber || orderId.slice(0, 8)}
							</h3>
						</div>
						<Button
							variant="ghost"
							size="icon"
							onClick={onClose}
							aria-label="Yopish"
							className="text-white hover:bg-white/20 rounded-full transition-colors"
						>
							<X className="w-6 h-6" />
						</Button>
					</div>
				</div>

				{/* Content */}
				<div className="p-6 space-y-6">
					{/* Loading State */}
					{loading && (
						<div className="flex flex-col items-center justify-center py-12 space-y-4">
							<div className="relative">
								<div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-500" />
								<Package className="w-6 h-6 text-orange-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
</div>
							<p className="text-gray-600 text-sm">Ma&apos;lumotlar yuklanmoqda...</p>
						</div>
					)}

					{/* Error State */}
					{error && (
						<div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 flex items-start space-x-3">
							<AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
							<div>
								<h4 className="font-semibold text-red-800 mb-1">Xatolik yuz berdi</h4>
								<p className="text-red-700 text-sm">{error}</p>
								<Button
									onClick={fetchTrackingData}
									className="mt-3 bg-red-600 hover:bg-red-700 text-white"
									size="sm"
								>
									Qayta urinish
								</Button>
							</div>
						</div>
					)}

					{/* Success State */}
					{!loading && order && (
						<div className="space-y-6">
							{/* Order Status Badge */}
							<div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border-2 border-gray-200">
								<div className="flex items-center justify-between flex-wrap gap-3">
									<div className="flex items-center space-x-3">
										<CheckCircle className="w-6 h-6 text-gray-600" />
										<span className="text-sm font-medium text-gray-600">
											Buyurtma holati
										</span>
									</div>
									<span
										className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${getStatusColor(order.status)}`}
									>
										{ORDER_STATUS_LABELS[order.status]}
									</span>
								</div>
							</div>

							{/* Tracking Information */}
							{tracking && tracking.driverLocation ? (
								<div className="space-y-4">
									{/* Distance & ETA Cards */}
									<div className="grid grid-cols-2 gap-4">
										<div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border-2 border-blue-200 shadow-sm hover:shadow-md transition-shadow">
											<div className="flex items-center space-x-2 mb-2">
												<Navigation className="w-5 h-5 text-blue-600" />
												<span className="text-xs font-medium text-blue-700 uppercase tracking-wide">
													Masofa
												</span>
											</div>
											<div className="text-3xl font-bold text-blue-700">
												{tracking.distance.toFixed(1)}
												<span className="text-xl ml-1">km</span>
											</div>
										</div>

										<div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5 border-2 border-orange-200 shadow-sm hover:shadow-md transition-shadow">
											<div className="flex items-center space-x-2 mb-2">
												<Clock className="w-5 h-5 text-orange-600" />
												<span className="text-xs font-medium text-orange-700 uppercase tracking-wide">
													Yetib boradi
												</span>
											</div>
											<div className="text-2xl font-bold text-orange-700">
												{formatETA(tracking.eta)}
											</div>
										</div>
									</div>

									{/* Progress Bar */}
									<div className="bg-gray-50 rounded-xl p-5 border-2 border-gray-200">
										<div className="space-y-3">
											<div className="flex items-center justify-between text-sm text-gray-600 mb-2">
												<span className="font-medium">Yetkazish jarayoni</span>
												<span className="text-xs">
													{Math.min(100, Math.max(0, 100 - tracking.distance * 10))}%
												</span>
											</div>
											<div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
												<div
													className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500 via-orange-400 to-green-500 rounded-full transition-all duration-500 ease-out shadow-lg"
													style={{
														width: `${Math.min(100, Math.max(0, 100 - tracking.distance * 10))}%`,
													}}
												/>
											</div>
											<div className="flex justify-between items-center text-xs text-gray-500 pt-1">
												<div className="flex items-center space-x-1">
													<span className="text-lg">🍕</span>
													<span>Restaurant</span>
												</div>
												<div className="flex items-center space-x-1">
													<span className="text-lg">🚗</span>
													<span>Yo&apos;lda</span>
												</div>
												<div className="flex items-center space-x-1">
													<span className="text-lg">🏠</span>
													<span>Manzil</span>
												</div>
											</div>
										</div>
									</div>

									{/* Nearby Alert */}
									{tracking.isNearby && (
										<div className="bg-green-50 border-2 border-green-300 rounded-xl p-4 flex items-center space-x-3 animate-pulse">
											<CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
											<p className="text-green-800 font-medium text-sm">
												🎉 Haydovchi yaqinda! Buyurtmangiz 2-3 daqiqada yetib keladi.
											</p>
										</div>
									)}
								</div>
							) : (
								<div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 text-center">
									<Truck className="w-12 h-12 text-blue-500 mx-auto mb-3" />
									<p className="text-blue-900 font-medium mb-1">
										Haydovchi yo&apos;lga chiqmadi
									</p>
									<p className="text-blue-700 text-sm">
										Haydovchi yo&apos;lga chiqqach GPS kuzatuv va yo&apos;nalishni bu yerda
										ko&apos;rishingiz mumkin
									</p>
								</div>
							)}

							{/* Driver Information */}
							{driver && (
								<div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border-2 border-gray-200">
									<div className="flex items-center space-x-2 mb-4">
										<Truck className="w-5 h-5 text-gray-700" />
										<h4 className="font-semibold text-gray-800">
											Haydovchi ma&apos;lumotlari
										</h4>
									</div>
									<div className="space-y-3">
										<div className="flex items-center justify-between">
											<span className="text-sm text-gray-600">Ism</span>
											<span className="font-medium text-gray-900">{driver.name}</span>
										</div>
										<div className="flex items-center justify-between">
											<span className="text-sm text-gray-600">Transport</span>
											<span className="font-medium text-gray-900">
												{driver.vehicleType}
											</span>
										</div>
										<a
											href={`tel:${driver.phone}`}
											className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition-colors mt-3"
										>
											<Phone className="w-4 h-4" />
											<span className="font-medium">{driver.phone}</span>
										</a>
									</div>
								</div>
							)}

							{/* Delivery Address */}
							<div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border-2 border-gray-200">
								<div className="flex items-start space-x-3">
									<MapPin className="w-5 h-5 text-gray-700 flex-shrink-0 mt-0.5" />
									<div>
										<h4 className="font-semibold text-gray-800 mb-1">
											Yetkazish manzili
										</h4>
										<p className="text-gray-700 text-sm leading-relaxed">
											{order.deliveryAddress}
										</p>
									</div>
								</div>
							</div>

							{/* Map Button */}
							<Button
								onClick={handleViewOnMap}
								className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-6 rounded-xl shadow-lg hover:shadow-xl transition-all text-base font-semibold"
								size="lg"
							>
								<Map className="w-5 h-5 mr-2" />
								Xaritada to&apos;liq ko&apos;rish
							</Button>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
