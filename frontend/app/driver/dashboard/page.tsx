/**
 * 🚗 DRIVER DASHBOARD
 * Driver uchun umumiy dashboard:
 * - Aktiv buyurtmalar (CONFIRMED, OUT_FOR_DELIVERY)
 * - Bugungi statistika
 * - Yangi buyurtmalarni qabul qilish
 */

'use client'

import { buildApiUrl } from '@/lib/apiBaseUrl'
import { useAuth } from '@/lib/AuthContext'
import {
	AlertCircle,
	ArrowRight,
	CheckCircle,
	Clock,
	MapPin,
	Package,
	PhoneCall,
	TrendingUp,
	Truck,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

// Types
interface Order {
	id: string
	orderNumber: string
	status: string
	totalPrice: number
	deliveryAddress: string
	customerPhone: string
	deliveryInstructions?: string
	createdAt: string
	user: {
		name: string
		phone: string
	}
}

interface DashboardStats {
	todayOrders: number
	activeDeliveries: number
	completedToday: number
	totalEarnings: number
}

export default function DriverDashboard() {
	const { backendUser } = useAuth()
	const [orders, setOrders] = useState<Order[]>([])
	const [stats, setStats] = useState<DashboardStats>({
		todayOrders: 0,
		activeDeliveries: 0,
		completedToday: 0,
		totalEarnings: 0,
	})
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	// Fetch driver's orders
	useEffect(() => {
		fetchOrders()

		// Auto-refresh har 30 soniyada
		const interval = setInterval(fetchOrders, 30000)
		return () => clearInterval(interval)
	}, [])

	async function fetchOrders() {
		try {
			const token = localStorage.getItem('firebaseToken')
			if (!token) throw new Error('Token topilmadi')

			const response = await fetch(buildApiUrl('/api/orders/driver'), {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})

			if (!response.ok) throw new Error("Buyurtmalarni yuklab bo'lmadi")

			const data = await response.json()

			if (data.success) {
				const driverOrders = data.data || []
				setOrders(driverOrders)

				// Calculate stats
				const today = new Date()
				today.setHours(0, 0, 0, 0)

				const todayOrders = driverOrders.filter((o: Order) => new Date(o.createdAt) >= today)

				setStats({
					todayOrders: todayOrders.length,
					activeDeliveries: driverOrders.filter((o: Order) =>
						['CONFIRMED', 'OUT_FOR_DELIVERY', 'PREPARING'].includes(o.status),
					).length,
					completedToday: todayOrders.filter((o: Order) => o.status === 'DELIVERED').length,
					totalEarnings: todayOrders
						.filter((o: Order) => o.status === 'DELIVERED')
						.reduce((sum: number, o: Order) => sum + o.totalPrice, 0),
				})
			}
		} catch (err) {
			console.error('Fetch orders error:', err)
			setError(err instanceof Error ? err.message : 'Xatolik yuz berdi')
		} finally {
			setLoading(false)
		}
	}

	// Loading state
	if (loading) {
		return (
			<div className='flex items-center justify-center py-20'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto'></div>
					<p className='mt-4 text-gray-600'>Yuklanmoqda...</p>
				</div>
			</div>
		)
	}

	// Error state
	if (error) {
		return (
			<div className='flex items-center justify-center py-20'>
				<div className='text-center'>
					<AlertCircle className='w-12 h-12 text-red-500 mx-auto' />
					<p className='mt-4 text-red-600 font-medium'>{error}</p>
					<button
						onClick={fetchOrders}
						className='mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
					>
						Qayta urinish
					</button>
				</div>
			</div>
		)
	}

	// Active orders (CONFIRMED, OUT_FOR_DELIVERY)
	const activeOrders = orders.filter(o =>
		['CONFIRMED', 'OUT_FOR_DELIVERY', 'PREPARING'].includes(o.status),
	)

	return (
		<div className='space-y-6'>
			{/* Welcome Section */}
			<div className='bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl'>
				<h1 className='text-3xl font-bold mb-2'>
					Assalomu alaykum, {backendUser?.name || 'Driver'}! 👋
				</h1>
				<p className='text-blue-100'>Bugun {stats.todayOrders} ta buyurtma mavjud</p>
			</div>

			{/* Stats Cards */}
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
				<StatCard
					icon={Package}
					label='Bugungi buyurtmalar'
					value={stats.todayOrders}
					color='blue'
				/>
				<StatCard
					icon={Truck}
					label='Aktiv yetkazishlar'
					value={stats.activeDeliveries}
					color='orange'
					pulse
				/>
				<StatCard icon={CheckCircle} label='Bajarildi' value={stats.completedToday} color='green' />
				<StatCard
					icon={TrendingUp}
					label='Bugungi daromad'
					value={`${stats.totalEarnings.toLocaleString()} so'm`}
					color='purple'
				/>
			</div>

			{/* Active Orders */}
			<div className='bg-white rounded-2xl shadow-lg p-6'>
				<div className='flex items-center justify-between mb-6'>
					<h2 className='text-2xl font-bold text-gray-900 flex items-center'>
						<Truck className='w-7 h-7 text-blue-600 mr-3' />
						Aktiv buyurtmalar
					</h2>
					{activeOrders.length > 0 && (
						<span className='px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold'>
							{activeOrders.length} ta faol
						</span>
					)}
				</div>

				{activeOrders.length === 0 ? (
					<div className='text-center py-12'>
						<Package className='w-16 h-16 text-gray-300 mx-auto mb-4' />
						<p className='text-gray-500 text-lg'>Hozircha aktiv buyurtmalar yo&apos;q</p>
						<p className='text-gray-400 text-sm mt-2'>
							Yangi buyurtmalar paydo bo&apos;lganida bu yerda ko&apos;rinadi
						</p>
					</div>
				) : (
					<div className='space-y-4'>
						{activeOrders.map(order => (
							<OrderCard key={order.id} order={order} />
						))}
					</div>
				)}
			</div>
		</div>
	)
}

/**
 * Stats Card Component
 */
interface StatCardProps {
	icon: React.ElementType
	label: string
	value: string | number
	color: 'blue' | 'orange' | 'green' | 'purple'
	pulse?: boolean
}

function StatCard({ icon: Icon, label, value, color, pulse }: StatCardProps) {
	const colorClasses = {
		blue: 'from-blue-500 to-blue-600',
		orange: 'from-orange-500 to-orange-600',
		green: 'from-green-500 to-green-600',
		purple: 'from-purple-500 to-purple-600',
	}

	return (
		<div className='bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow'>
			<div className='flex items-center justify-between'>
				<div>
					<p className='text-sm text-gray-600 mb-1'>{label}</p>
					<p className='text-2xl font-bold text-gray-900'>{value}</p>
				</div>
				<div
					className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center shadow-md ${pulse ? 'animate-pulse' : ''}`}
				>
					<Icon className='w-7 h-7 text-white' />
				</div>
			</div>
		</div>
	)
}

/**
 * Order Card Component
 */
interface OrderCardProps {
	order: Order
}

function OrderCard({ order }: OrderCardProps) {
	const statusConfig = {
		CONFIRMED: { label: 'Tasdiqlandi', color: 'blue', icon: CheckCircle },
		OUT_FOR_DELIVERY: { label: "Yo'lda", color: 'orange', icon: Truck },
		PREPARING: { label: 'Tayyorlanmoqda', color: 'yellow', icon: Clock },
	}

	const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.CONFIRMED

	return (
		<div className='border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all hover:border-blue-300 bg-gradient-to-r from-white to-blue-50'>
			<div className='flex items-start justify-between mb-4'>
				{/* Order Info */}
				<div className='flex-1'>
					<div className='flex items-center space-x-3 mb-2'>
						<h3 className='text-lg font-bold text-gray-900'>#{order.orderNumber}</h3>
						<span
							className={`px-3 py-1 rounded-full text-xs font-semibold bg-${status.color}-100 text-${status.color}-700 flex items-center`}
						>
							<status.icon className='w-3 h-3 mr-1' />
							{status.label}
						</span>
					</div>

					{/* Customer Info */}
					<div className='space-y-2 text-sm'>
						<div className='flex items-center text-gray-700'>
							<PhoneCall className='w-4 h-4 mr-2 text-gray-400' />
							<span className='font-medium'>{order.user.name}</span>
							<span className='mx-2'>•</span>
							<a href={`tel:${order.user.phone}`} className='text-blue-600 hover:underline'>
								{order.user.phone}
							</a>
						</div>

						<div className='flex items-start text-gray-700'>
							<MapPin className='w-4 h-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0' />
							<span>{order.deliveryAddress}</span>
						</div>
					</div>

					{/* Delivery Instructions */}
					{order.deliveryInstructions && (
						<div className='mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg'>
							<p className='text-sm text-yellow-800'>
								<strong>Izoh:</strong> {order.deliveryInstructions}
							</p>
						</div>
					)}
				</div>

				{/* Price */}
				<div className='text-right ml-4'>
					<p className='text-2xl font-bold text-gray-900'>{order.totalPrice.toLocaleString()}</p>
					<p className='text-sm text-gray-500'>so&apos;m</p>
				</div>
			</div>

			{/* Action Button */}
			{order.status === 'OUT_FOR_DELIVERY' ? (
				<Link
					href={`/driver/delivery/${order.id}`}
					className='w-full flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all hover:from-blue-700 hover:to-indigo-700'
				>
					<MapPin className='w-5 h-5' />
					<span>GPS Tracking Ochish</span>
					<ArrowRight className='w-5 h-5' />
				</Link>
			) : (
				<Link
					href={`/driver/delivery/${order.id}`}
					className='w-full flex items-center justify-center space-x-2 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-all'
				>
					<Package className='w-5 h-5' />
					<span>Batafsil ko&apos;rish</span>
					<ArrowRight className='w-5 h-5' />
				</Link>
			)}
		</div>
	)
}
