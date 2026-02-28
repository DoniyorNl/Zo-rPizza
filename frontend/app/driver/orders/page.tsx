/**
 * 🚗 DRIVER ORDERS PAGE
 * Barcha buyurtmalarni ko'rish va filter qilish
 * - Active orders (CONFIRMED, PREPARING, OUT_FOR_DELIVERY)
 * - Completed orders (DELIVERED)
 * - Cancelled orders
 * - Filter by status, date
 */

'use client'

import { buildApiUrl } from '@/lib/apiBaseUrl'
import { useAuth } from '@/lib/AuthContext'
import {
	AlertCircle,
	ArrowRight,
	Calendar,
	CheckCircle,
	Clock,
	MapPin,
	Package,
	PhoneCall,
	Search,
	Truck,
	X,
	XCircle,
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
	updatedAt: string
	user: {
		name: string
		phone: string
	}
}

type OrderStatus =
	| 'ALL'
	| 'CONFIRMED'
	| 'PREPARING'
	| 'OUT_FOR_DELIVERY'
	| 'DELIVERED'
	| 'CANCELLED'

export default function DriverOrdersPage() {
	useAuth()
	const [orders, setOrders] = useState<Order[]>([])
	const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('ALL')
	const [searchQuery, setSearchQuery] = useState('')

	// Fetch orders
	useEffect(() => {
		fetchOrders()

		// Auto-refresh har 30 soniyada
		const interval = setInterval(fetchOrders, 30000)
		return () => clearInterval(interval)
	}, [])

	// Filter orders
	useEffect(() => {
		let filtered = [...orders]

		// Status filter
		if (selectedStatus !== 'ALL') {
			filtered = filtered.filter(o => o.status === selectedStatus)
		}

		// Search filter
		if (searchQuery) {
			const query = searchQuery.toLowerCase()
			filtered = filtered.filter(
				o =>
					o.orderNumber.toLowerCase().includes(query) ||
					o.user.name.toLowerCase().includes(query) ||
					o.deliveryAddress.toLowerCase().includes(query) ||
					o.user.phone.includes(query),
			)
		}

		setFilteredOrders(filtered)
	}, [orders, selectedStatus, searchQuery])

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
				// Sort by date (newest first)
				driverOrders.sort(
					(a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
				)
				setOrders(driverOrders)
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

	// Stats
	const stats = {
		all: orders.length,
		active: orders.filter(o => ['CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY'].includes(o.status))
			.length,
		completed: orders.filter(o => o.status === 'DELIVERED').length,
		cancelled: orders.filter(o => o.status === 'CANCELLED').length,
	}

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl'>
				<div className='flex items-center justify-between'>
					<div>
						<h1 className='text-3xl font-bold mb-2'>Buyurtmalar</h1>
						<p className='text-blue-100'>Barcha buyurtmalaringizni boshqaring</p>
					</div>
					<Package className='w-16 h-16 opacity-50' />
				</div>
			</div>

			{/* Stats Cards */}
			<div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
				<StatusCard
					label='Jami'
					count={stats.all}
					icon={Package}
					color='blue'
					active={selectedStatus === 'ALL'}
					onClick={() => setSelectedStatus('ALL')}
				/>
				<StatusCard
					label='Aktiv'
					count={stats.active}
					icon={Truck}
					color='orange'
					active={selectedStatus === 'OUT_FOR_DELIVERY'}
					onClick={() => setSelectedStatus('OUT_FOR_DELIVERY')}
				/>
				<StatusCard
					label='Bajarildi'
					count={stats.completed}
					icon={CheckCircle}
					color='green'
					active={selectedStatus === 'DELIVERED'}
					onClick={() => setSelectedStatus('DELIVERED')}
				/>
				<StatusCard
					label='Bekor qilindi'
					count={stats.cancelled}
					icon={XCircle}
					color='red'
					active={selectedStatus === 'CANCELLED'}
					onClick={() => setSelectedStatus('CANCELLED')}
				/>
			</div>

			{/* Filters */}
			<div className='bg-white rounded-xl shadow-md p-6'>
				<div className='flex flex-col md:flex-row gap-4'>
					{/* Search */}
					<div className='flex-1 relative'>
						<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400' />
						<input
							type='text'
							placeholder='Buyurtma raqami, mijoz nomi, telefon yoki manzil...'
							value={searchQuery}
							onChange={e => setSearchQuery(e.target.value)}
							className='w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
						/>
						{searchQuery && (
							<button
								onClick={() => setSearchQuery('')}
								className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
							>
								<X className='w-5 h-5' />
							</button>
						)}
					</div>

					{/* Status Filter */}
					<select
						value={selectedStatus}
						onChange={e => setSelectedStatus(e.target.value as OrderStatus)}
						className='px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white'
					>
						<option value='ALL'>Barcha holatlar</option>
						<option value='CONFIRMED'>Tasdiqlandi</option>
						<option value='PREPARING'>Tayyorlanmoqda</option>
						<option value='OUT_FOR_DELIVERY'>Yo&apos;lda</option>
						<option value='DELIVERED'>Yetkazib berildi</option>
						<option value='CANCELLED'>Bekor qilindi</option>
					</select>
				</div>

				<div className='mt-4 flex items-center justify-between text-sm text-gray-600'>
					<span>
						<strong>{filteredOrders.length}</strong> ta buyurtma topildi
					</span>
					{(selectedStatus !== 'ALL' || searchQuery) && (
						<button
							onClick={() => {
								setSelectedStatus('ALL')
								setSearchQuery('')
							}}
							className='text-blue-600 hover:text-blue-700 font-medium'
						>
							Filtrlarni tozalash
						</button>
					)}
				</div>
			</div>

			{/* Orders List */}
			<div className='bg-white rounded-2xl shadow-lg p-6'>
				{filteredOrders.length === 0 ? (
					<div className='text-center py-12'>
						<Package className='w-16 h-16 text-gray-300 mx-auto mb-4' />
						<p className='text-gray-500 text-lg'>Buyurtmalar topilmadi</p>
						<p className='text-gray-400 text-sm mt-2'>
							{selectedStatus !== 'ALL' || searchQuery
								? "Filter parametrlarini o'zgartiring"
								: "Hozircha sizda buyurtmalar yo'q"}
						</p>
					</div>
				) : (
					<div className='space-y-4'>
						{filteredOrders.map(order => (
							<OrderCard key={order.id} order={order} />
						))}
					</div>
				)}
			</div>
		</div>
	)
}

/**
 * Status Card Component
 */
interface StatusCardProps {
	label: string
	count: number
	icon: React.ElementType
	color: 'blue' | 'orange' | 'green' | 'red'
	active: boolean
	onClick: () => void
}

function StatusCard({ label, count, icon: Icon, color, active, onClick }: StatusCardProps) {
	const colorClasses = {
		blue: active
			? 'from-blue-500 to-blue-600 shadow-lg'
			: 'from-blue-100 to-blue-200 hover:from-blue-500 hover:to-blue-600',
		orange: active
			? 'from-orange-500 to-orange-600 shadow-lg'
			: 'from-orange-100 to-orange-200 hover:from-orange-500 hover:to-orange-600',
		green: active
			? 'from-green-500 to-green-600 shadow-lg'
			: 'from-green-100 to-green-200 hover:from-green-500 hover:to-green-600',
		red: active
			? 'from-red-500 to-red-600 shadow-lg'
			: 'from-red-100 to-red-200 hover:from-red-500 hover:to-red-600',
	}

	return (
		<button
			onClick={onClick}
			className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl p-6 transition-all cursor-pointer transform hover:scale-105 ${active ? 'ring-4 ring-offset-2 ring-' + color + '-300' : ''}`}
		>
			<div className='flex items-center justify-between'>
				<div className='text-left'>
					<p className={`text-sm font-medium ${active ? 'text-white' : 'text-gray-600'}`}>
						{label}
					</p>
					<p className={`text-3xl font-bold ${active ? 'text-white' : 'text-gray-900'}`}>{count}</p>
				</div>
				<Icon className={`w-10 h-10 ${active ? 'text-white' : 'text-gray-600'}`} />
			</div>
		</button>
	)
}

/**
 * Order Card Component
 */
interface OrderCardProps {
	order: Order
}

function OrderCard({ order }: OrderCardProps) {
	const statusConfig: Record<
		string,
		{ label: string; color: string; bgColor: string; icon: React.ElementType }
	> = {
		CONFIRMED: {
			label: 'Tasdiqlandi',
			color: 'text-blue-700',
			bgColor: 'bg-blue-100',
			icon: CheckCircle,
		},
		OUT_FOR_DELIVERY: {
			label: "Yo'lda",
			color: 'text-orange-700',
			bgColor: 'bg-orange-100',
			icon: Truck,
		},
		PREPARING: {
			label: 'Tayyorlanmoqda',
			color: 'text-yellow-700',
			bgColor: 'bg-yellow-100',
			icon: Clock,
		},
		DELIVERED: {
			label: 'Yetkazildi',
			color: 'text-green-700',
			bgColor: 'bg-green-100',
			icon: CheckCircle,
		},
		CANCELLED: {
			label: 'Bekor qilindi',
			color: 'text-red-700',
			bgColor: 'bg-red-100',
			icon: XCircle,
		},
	}

	const status = statusConfig[order.status] || statusConfig.CONFIRMED
	const orderDate = new Date(order.createdAt)

	return (
		<div className='border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all hover:border-blue-300 bg-gradient-to-r from-white to-blue-50'>
			<div className='flex items-start justify-between mb-4'>
				{/* Order Info */}
				<div className='flex-1'>
					<div className='flex items-center space-x-3 mb-2'>
						<h3 className='text-lg font-bold text-gray-900'>#{order.orderNumber}</h3>
						<span
							className={`px-3 py-1 rounded-full text-xs font-semibold ${status.bgColor} ${status.color} flex items-center`}
						>
							<status.icon className='w-3 h-3 mr-1' />
							{status.label}
						</span>
					</div>

					<div className='flex items-center text-xs text-gray-500 mb-3'>
						<Calendar className='w-3 h-3 mr-1' />
						{orderDate.toLocaleDateString('uz-UZ', {
							year: 'numeric',
							month: 'long',
							day: 'numeric',
							hour: '2-digit',
							minute: '2-digit',
						})}
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
			{order.status === 'OUT_FOR_DELIVERY' && (
				<Link
					href={`/driver/delivery/${order.id}`}
					className='w-full flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all hover:from-blue-700 hover:to-indigo-700'
				>
					<MapPin className='w-5 h-5' />
					<span>GPS Tracking Ochish</span>
					<ArrowRight className='w-5 h-5' />
				</Link>
			)}

			{order.status === 'CONFIRMED' || order.status === 'PREPARING' ? (
				<Link
					href={`/driver/delivery/${order.id}`}
					className='w-full flex items-center justify-center space-x-2 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-all'
				>
					<Package className='w-5 h-5' />
					<span>Batafsil ko&apos;rish</span>
					<ArrowRight className='w-5 h-5' />
				</Link>
			) : null}
		</div>
	)
}
