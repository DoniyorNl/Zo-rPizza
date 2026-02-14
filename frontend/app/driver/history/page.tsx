/**
 * 🚗 DRIVER HISTORY PAGE
 * Driver ning yetkazib bergan buyurtmalar tarixi
 * - Status filter va custom date range
 * - Statistics va earnings
 * - Date range filter
 * - Export to PDF/Excel
 */

'use client'

import { buildApiUrl } from '@/lib/apiBaseUrl'
import { useAuth } from '@/lib/AuthContext'
import {
	AlertCircle,
	Calendar,
	CheckCircle,
	ChevronDown,
	ChevronUp,
	Clock,
	DollarSign,
	Download,
	MapPin,
	Package,
	PhoneCall,
	RefreshCw,
	TrendingUp,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

// Types
interface Order {
	id: string
	orderNumber: string
	status: string
	totalPrice: number
	deliveryAddress: string
	deliveryInstructions?: string
	createdAt: string
	updatedAt: string
	user: {
		name: string
		phone: string
	}
}

interface Stats {
	totalDeliveries: number
	totalEarnings: number
	todayDeliveries: number
	todayEarnings: number
	weekDeliveries: number
	weekEarnings: number
	monthDeliveries: number
	monthEarnings: number
}

function formatStatusLabel(status: string) {
	switch (status) {
		case 'DELIVERED':
			return 'Yetkazildi'
		case 'CANCELLED':
			return 'Bekor qilindi'
		case 'IN_PROGRESS':
			return 'Jarayonda'
		case 'ON_THE_WAY':
			return 'Yo‘lda'
		case 'PENDING':
			return 'Kutilmoqda'
		default:
			return status.replace(/_/g, ' ')
	}
}

function getStatusTone(status: string) {
	switch (status) {
		case 'DELIVERED':
			return {
				badge: 'bg-green-100 text-green-700 border-green-200',
				icon: 'bg-green-100 text-green-600',
				accent: 'text-green-600',
			}
		case 'CANCELLED':
			return {
				badge: 'bg-red-100 text-red-700 border-red-200',
				icon: 'bg-red-100 text-red-600',
				accent: 'text-red-600',
			}
		case 'ON_THE_WAY':
			return {
				badge: 'bg-blue-100 text-blue-700 border-blue-200',
				icon: 'bg-blue-100 text-blue-600',
				accent: 'text-blue-600',
			}
		case 'IN_PROGRESS':
			return {
				badge: 'bg-amber-100 text-amber-700 border-amber-200',
				icon: 'bg-amber-100 text-amber-600',
				accent: 'text-amber-600',
			}
		case 'PENDING':
			return {
				badge: 'bg-slate-100 text-slate-700 border-slate-200',
				icon: 'bg-slate-100 text-slate-600',
				accent: 'text-slate-600',
			}
		default:
			return {
				badge: 'bg-gray-100 text-gray-700 border-gray-200',
				icon: 'bg-gray-100 text-gray-600',
				accent: 'text-gray-600',
			}
	}
}

export default function DriverHistoryPage() {
	const { backendUser } = useAuth()
	const [orders, setOrders] = useState<Order[]>([])
	const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
	const [loading, setLoading] = useState(true)
	const [isRefreshing, setIsRefreshing] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'all'>('all')
	const [statusFilter, setStatusFilter] = useState<'ALL' | string>('DELIVERED')
	const [dateRange, setDateRange] = useState<{ from: string; to: string }>({ from: '', to: '' })
	const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set())
	const abortRef = useRef<AbortController | null>(null)
	const [stats, setStats] = useState<Stats>({
		totalDeliveries: 0,
		totalEarnings: 0,
		todayDeliveries: 0,
		todayEarnings: 0,
		weekDeliveries: 0,
		weekEarnings: 0,
		monthDeliveries: 0,
		monthEarnings: 0,
	})

	// Filter orders by period/status/date range
	useEffect(() => {
		const now = new Date()
		const statusFiltered =
			statusFilter === 'ALL' ? orders : orders.filter(o => o.status === statusFilter)
		let filtered = [...statusFiltered]

		const hasCustomRange = Boolean(dateRange.from || dateRange.to)
		if (hasCustomRange) {
			const fromDate = dateRange.from ? new Date(`${dateRange.from}T00:00:00`) : null
			const toDate = dateRange.to ? new Date(`${dateRange.to}T23:59:59`) : null
			filtered = filtered.filter(order => {
				const deliveredAt = new Date(order.updatedAt)
				if (fromDate && deliveredAt < fromDate) return false
				if (toDate && deliveredAt > toDate) return false
				return true
			})
			setFilteredOrders(filtered)
			return
		}

		switch (selectedPeriod) {
			case 'today':
				const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
				filtered = statusFiltered.filter(o => new Date(o.updatedAt) >= todayStart)
				break

			case 'week':
				const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
				filtered = statusFiltered.filter(o => new Date(o.updatedAt) >= weekStart)
				break

			case 'month':
				const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
				filtered = statusFiltered.filter(o => new Date(o.updatedAt) >= monthStart)
				break

			case 'all':
			default:
				filtered = statusFiltered
				break
		}

		setFilteredOrders(filtered)
	}, [orders, selectedPeriod, statusFilter, dateRange])

	const fetchHistory = useCallback(async ({ showLoader }: { showLoader: boolean }) => {
		try {
			setError(null)
			if (showLoader) {
				setLoading(true)
			} else {
				setIsRefreshing(true)
			}

			abortRef.current?.abort()
			const controller = new AbortController()
			abortRef.current = controller

			const token = localStorage.getItem('firebaseToken')
			if (!token) throw new Error('Token topilmadi')

			const response = await fetch(buildApiUrl('/api/orders/driver'), {
				headers: {
					Authorization: `Bearer ${token}`,
				},
				signal: controller.signal,
			})

			if (!response.ok) throw new Error("Tarixni yuklab bo'lmadi")

			const data = await response.json()

			if (data.success) {
				const driverOrders = data.data || []

				// Sort by date (newest first)
				driverOrders.sort(
					(a: Order, b: Order) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
				)

				setOrders(driverOrders)
			}
		} catch (err) {
			if (err instanceof Error && err.name === 'AbortError') {
				return
			}
			console.error('Fetch history error:', err)
			setError(err instanceof Error ? err.message : 'Xatolik yuz berdi')
		} finally {
			setLoading(false)
			setIsRefreshing(false)
			abortRef.current = null
		}
	}, [])

	useEffect(() => {
		const statusFiltered =
			statusFilter === 'ALL' ? orders : orders.filter(o => o.status === statusFilter)
		calculateStats(statusFiltered)
	}, [orders, statusFilter])

	// Fetch delivered orders
	useEffect(() => {
		fetchHistory({ showLoader: true })
		return () => {
			abortRef.current?.abort()
		}
	}, [fetchHistory])

	function calculateStats(deliveredOrders: Order[]) {
		const now = new Date()
		const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
		const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
		const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

		const todayOrders = deliveredOrders.filter(o => new Date(o.updatedAt) >= todayStart)
		const weekOrders = deliveredOrders.filter(o => new Date(o.updatedAt) >= weekStart)
		const monthOrders = deliveredOrders.filter(o => new Date(o.updatedAt) >= monthStart)

		setStats({
			totalDeliveries: deliveredOrders.length,
			totalEarnings: deliveredOrders.reduce((sum, o) => sum + o.totalPrice, 0),
			todayDeliveries: todayOrders.length,
			todayEarnings: todayOrders.reduce((sum, o) => sum + o.totalPrice, 0),
			weekDeliveries: weekOrders.length,
			weekEarnings: weekOrders.reduce((sum, o) => sum + o.totalPrice, 0),
			monthDeliveries: monthOrders.length,
			monthEarnings: monthOrders.reduce((sum, o) => sum + o.totalPrice, 0),
		})
	}

	function toggleOrderExpand(orderId: string) {
		const newExpanded = new Set(expandedOrders)
		if (newExpanded.has(orderId)) {
			newExpanded.delete(orderId)
		} else {
			newExpanded.add(orderId)
		}
		setExpandedOrders(newExpanded)
	}

	function handlePeriodChange(period: 'today' | 'week' | 'month' | 'all') {
		setSelectedPeriod(period)
		if (dateRange.from || dateRange.to) {
			setDateRange({ from: '', to: '' })
		}
	}

	function handleDateChange(key: 'from' | 'to', value: string) {
		setDateRange(prev => ({ ...prev, [key]: value }))
	}

	function formatDateValue(value: string) {
		if (!value) return ''
		const parsed = new Date(`${value}T00:00:00`)
		if (Number.isNaN(parsed.getTime())) return value
		return parsed.toLocaleDateString('uz-UZ', {
			day: '2-digit',
			month: 'short',
		})
	}

	function csvEscape(value: string) {
		const normalized = value.replace(/\r?\n/g, ' ').trim()
		return `"${normalized.replace(/"/g, '""')}"`
	}

	function escapeHtml(value: string) {
		return value
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;')
	}

	function handleExport() {
		if (filteredOrders.length === 0) return
		const headers = [
			'OrderNumber',
			'DeliveredAt',
			'CustomerName',
			'CustomerPhone',
			'Address',
			'TotalPrice',
			'Instructions',
		]

		const rows = filteredOrders.map(order => [
			csvEscape(order.orderNumber),
			csvEscape(new Date(order.updatedAt).toISOString()),
			csvEscape(order.user.name),
			csvEscape(order.user.phone),
			csvEscape(order.deliveryAddress),
			csvEscape(order.totalPrice.toString()),
			csvEscape(order.deliveryInstructions ?? ''),
		])

		const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
		const url = URL.createObjectURL(blob)
		const link = document.createElement('a')
		link.href = url
		link.download = `driver-history-${new Date().toISOString().slice(0, 10)}.csv`
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
		URL.revokeObjectURL(url)
	}

	function handlePdfExport() {
		if (filteredOrders.length === 0) return
		const now = new Date()
		const statusLabel = statusFilter === 'ALL' ? 'Barchasi' : formatStatusLabel(statusFilter)
		const rangeLabel = hasCustomRange ? dateRangeLabel : periodLabelMap[selectedPeriod]
		const rowsHtml = filteredOrders
			.map(order => {
				const deliveredAt = new Date(order.updatedAt).toLocaleString('uz-UZ')
				const createdAt = new Date(order.createdAt).toLocaleString('uz-UZ')
				return `
					<tr>
						<td>${escapeHtml(order.orderNumber)}</td>
						<td>${escapeHtml(formatStatusLabel(order.status))}</td>
						<td>${escapeHtml(order.user.name)}</td>
						<td>${escapeHtml(order.user.phone)}</td>
						<td>${escapeHtml(order.deliveryAddress)}</td>
						<td>${escapeHtml(deliveredAt)}</td>
						<td>${escapeHtml(createdAt)}</td>
						<td>${escapeHtml(order.totalPrice.toLocaleString())}</td>
					</tr>
				`
			})
			.join('')

		const html = `
			<!doctype html>
			<html lang="uz">
			<head>
				<meta charset="utf-8" />
				<title>Driver History Export</title>
				<style>
					* { box-sizing: border-box; }
					body { font-family: Arial, sans-serif; color: #111827; margin: 24px; }
					h1 { font-size: 20px; margin: 0 0 8px; }
					.meta { font-size: 12px; color: #4b5563; margin-bottom: 16px; }
					table { width: 100%; border-collapse: collapse; }
					th, td { border: 1px solid #e5e7eb; padding: 8px; font-size: 12px; text-align: left; }
					th { background: #f9fafb; }
					tfoot td { font-weight: 600; }
				</style>
			</head>
			<body>
				<h1>Buyurtmalar tarixi</h1>
				<div class="meta">
					<div>Haydovchi: ${escapeHtml(backendUser?.name ?? 'Noma’lum')}</div>
					<div>Holat: ${escapeHtml(statusLabel)}</div>
					<div>Davr: ${escapeHtml(rangeLabel)}</div>
					<div>Eksport vaqti: ${escapeHtml(now.toLocaleString('uz-UZ'))}</div>
				</div>
				<table>
					<thead>
						<tr>
							<th>Buyurtma #</th>
							<th>Status</th>
							<th>Mijoz</th>
							<th>Telefon</th>
							<th>Manzil</th>
							<th>Yetkazildi</th>
							<th>Yaratilgan</th>
							<th>Summa</th>
						</tr>
					</thead>
					<tbody>
						${rowsHtml}
					</tbody>
					<tfoot>
						<tr>
							<td colspan="7">Jami</td>
							<td>${escapeHtml(stats.totalEarnings.toLocaleString())} so'm</td>
						</tr>
					</tfoot>
				</table>
			</body>
			</html>
		`

		const printWindow = window.open('', '_blank', 'width=900,height=700')
		if (!printWindow) return
		printWindow.document.open()
		printWindow.document.write(html)
		printWindow.document.close()
		printWindow.focus()
		printWindow.print()
	}

	// Loading state
	if (loading) {
		return (
			<div className='space-y-6'>
				<div className='bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white shadow-xl animate-pulse'>
					<div className='h-7 w-48 bg-white/20 rounded mb-3'></div>
					<div className='h-4 w-72 bg-white/20 rounded'></div>
				</div>
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
					{Array.from({ length: 4 }).map((_, index) => (
						<div
							key={`stat-skeleton-${index}`}
							className='bg-white rounded-xl shadow-md p-6 border border-gray-100 animate-pulse'
						>
							<div className='h-4 w-24 bg-gray-200 rounded mb-4'></div>
							<div className='h-6 w-32 bg-gray-200 rounded'></div>
						</div>
					))}
				</div>
				<div className='bg-white rounded-2xl shadow-lg p-6'>
					<div className='space-y-3'>
						{Array.from({ length: 5 }).map((_, index) => (
							<div
								key={`order-skeleton-${index}`}
								className='h-16 bg-gray-100 rounded-lg animate-pulse'
							></div>
						))}
					</div>
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
						onClick={() => fetchHistory({ showLoader: true })}
						className='mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
					>
						Qayta urinish
					</button>
				</div>
			</div>
		)
	}

	const periodLabelMap = {
		today: 'Bugun',
		week: "So'nggi 7 kun",
		month: 'Bu oy',
		all: 'Barchasi',
	}
	const hasCustomRange = Boolean(dateRange.from || dateRange.to)
	const dateRangeLabel = hasCustomRange
		? `${formatDateValue(dateRange.from) || '...'} - ${formatDateValue(dateRange.to) || '...'}`
		: ''

	return (
		<div className='relative'>
			<div className='pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(1200px_circle_at_top,_rgba(16,185,129,0.12),_transparent_55%)]'></div>
			<div className='space-y-6'>
				{/* Header */}
				<div className='bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white shadow-xl'>
					<div className='flex items-center justify-between'>
						<div>
							<h1 className='text-3xl font-bold mb-2'>Buyurtmalar Tarixi</h1>
							<p className='text-green-100'>Yetkazib berilgan buyurtmalar va daromad</p>
							{backendUser?.name && (
								<p className='text-green-200 text-sm mt-2'>Salom, {backendUser.name}</p>
							)}
						</div>
						<CheckCircle className='w-16 h-16 opacity-50' />
					</div>
				</div>

				{/* Overall Stats */}
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
					<StatsCard
						icon={Package}
						label='Jami yetkazildi'
						value={stats.totalDeliveries}
						color='blue'
					/>
					<StatsCard
						icon={DollarSign}
						label='Jami daromad'
						value={`${stats.totalEarnings.toLocaleString()} so'm`}
						color='green'
					/>
					<StatsCard
						icon={TrendingUp}
						label='Bugun yetkazildi'
						value={stats.todayDeliveries}
						color='orange'
					/>
					<StatsCard
						icon={Calendar}
						label='Bugungi daromad'
						value={`${stats.todayEarnings.toLocaleString()} so'm`}
						color='purple'
					/>
				</div>

				{/* Period Filter */}
				<div className='bg-white/95 backdrop-blur-md rounded-xl shadow-md p-6 md:sticky md:top-6 z-10'>
					<div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4'>
						<h3 className='text-lg font-semibold text-gray-900'>Davr bo'yicha filter</h3>
						<div className='flex items-center gap-3'>
							<button
								onClick={() => fetchHistory({ showLoader: false })}
								disabled={isRefreshing}
								className='flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
							>
								<RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
								<span className='text-sm'>Yangilash</span>
							</button>
							<button
								onClick={handlePdfExport}
								disabled={filteredOrders.length === 0 || isRefreshing}
								className='flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
							>
								<Download className='w-4 h-4' />
								<span className='text-sm'>PDF Export</span>
							</button>
							<button
								onClick={handleExport}
								disabled={filteredOrders.length === 0 || isRefreshing}
								className='flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
							>
								<Download className='w-4 h-4' />
								<span className='text-sm'>Excel (CSV)</span>
							</button>
						</div>
					</div>

					<div className='flex flex-wrap items-center gap-2 mb-4 text-xs text-gray-600'>
						<span className='rounded-full border border-gray-200 px-3 py-1 bg-white'>
							Davr: {periodLabelMap[selectedPeriod]}
						</span>
						<span className='rounded-full border border-gray-200 px-3 py-1 bg-white'>
							Status: {statusFilter === 'ALL' ? 'Barchasi' : formatStatusLabel(statusFilter)}
						</span>
						{hasCustomRange && (
							<span className='rounded-full border border-emerald-200 px-3 py-1 bg-emerald-50 text-emerald-700'>
								Sana: {dateRangeLabel}
							</span>
						)}
						{isRefreshing && <span className='text-emerald-600'>Yangilanmoqda...</span>}
					</div>

					<div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
						<div>
							<label
								htmlFor='driver-history-status'
								className='block text-sm font-medium text-gray-700 mb-2'
							>
								Status
							</label>
							<select
								id='driver-history-status'
								value={statusFilter}
								onChange={event => setStatusFilter(event.target.value)}
								className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
							>
								<option value='ALL'>Barchasi</option>
								{Array.from(new Set(orders.map(order => order.status))).map(status => (
									<option key={status} value={status}>
										{formatStatusLabel(status)}
									</option>
								))}
							</select>
						</div>

						<div>
							<label
								htmlFor='driver-history-from-date'
								className='block text-sm font-medium text-gray-700 mb-2'
							>
								Boshlanish sana
							</label>
							<input
								id='driver-history-from-date'
								type='date'
								value={dateRange.from}
								onChange={event => handleDateChange('from', event.target.value)}
								className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
							/>
						</div>

						<div>
							<label
								htmlFor='driver-history-to-date'
								className='block text-sm font-medium text-gray-700 mb-2'
							>
								Tugash sana
							</label>
							<input
								id='driver-history-to-date'
								type='date'
								value={dateRange.to}
								onChange={event => handleDateChange('to', event.target.value)}
								className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
							/>
						</div>
					</div>

					<div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
						<PeriodButton
							active={selectedPeriod === 'today'}
							onClick={() => handlePeriodChange('today')}
							label='Bugun'
							count={stats.todayDeliveries}
							earnings={stats.todayEarnings}
						/>
						<PeriodButton
							active={selectedPeriod === 'week'}
							onClick={() => handlePeriodChange('week')}
							label="So'nggi 7 kun"
							count={stats.weekDeliveries}
							earnings={stats.weekEarnings}
						/>
						<PeriodButton
							active={selectedPeriod === 'month'}
							onClick={() => handlePeriodChange('month')}
							label='Bu oy'
							count={stats.monthDeliveries}
							earnings={stats.monthEarnings}
						/>
						<PeriodButton
							active={selectedPeriod === 'all'}
							onClick={() => handlePeriodChange('all')}
							label='Barchasi'
							count={stats.totalDeliveries}
							earnings={stats.totalEarnings}
						/>
					</div>
				</div>

				{/* Orders List */}
				<div className='bg-white rounded-2xl shadow-lg p-6'>
					<h2 className='text-xl font-bold text-gray-900 mb-6 flex items-center'>
						<CheckCircle className='w-6 h-6 text-green-600 mr-3' />
						Buyurtmalar ro'yxati ({filteredOrders.length})
					</h2>

					{filteredOrders.length === 0 ? (
						<div className='text-center py-12'>
							<Package className='w-16 h-16 text-gray-300 mx-auto mb-4' />
							<p className='text-gray-500 text-lg'>Bu davrda buyurtmalar yo&apos;q</p>
							<p className='text-gray-400 text-sm mt-2'>Boshqa davr tanlang</p>
						</div>
					) : (
						<div className='space-y-3'>
							{filteredOrders.map(order => (
								<HistoryOrderCard
									key={order.id}
									order={order}
									expanded={expandedOrders.has(order.id)}
									onToggle={() => toggleOrderExpand(order.id)}
								/>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

/**
 * Stats Card Component
 */
interface StatsCardProps {
	icon: React.ElementType
	label: string
	value: string | number
	color: 'blue' | 'green' | 'orange' | 'purple'
}

function StatsCard({ icon: Icon, label, value, color }: StatsCardProps) {
	const colorClasses = {
		blue: 'from-blue-500 to-blue-600',
		green: 'from-green-500 to-green-600',
		orange: 'from-orange-500 to-orange-600',
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
					className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center shadow-md`}
				>
					<Icon className='w-7 h-7 text-white' />
				</div>
			</div>
		</div>
	)
}

/**
 * Period Button Component
 */
interface PeriodButtonProps {
	active: boolean
	onClick: () => void
	label: string
	count: number
	earnings: number
}

function PeriodButton({ active, onClick, label, count, earnings }: PeriodButtonProps) {
	return (
		<button
			onClick={onClick}
			className={`p-4 rounded-lg border-2 transition-all text-left ${active ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'}`}
		>
			<p className={`text-sm font-medium mb-1 ${active ? 'text-blue-600' : 'text-gray-600'}`}>
				{label}
			</p>
			<p className={`text-lg font-bold ${active ? 'text-blue-600' : 'text-gray-900'}`}>
				{count} ta
			</p>
			<p className={`text-xs ${active ? 'text-blue-600' : 'text-gray-500'}`}>
				{earnings.toLocaleString()} so&apos;m
			</p>
		</button>
	)
}

/**
 * History Order Card Component
 */
interface HistoryOrderCardProps {
	order: Order
	expanded: boolean
	onToggle: () => void
}

function HistoryOrderCard({ order, expanded, onToggle }: HistoryOrderCardProps) {
	const deliveryDate = new Date(order.updatedAt)
	const statusTone = getStatusTone(order.status)
	const statusLabel = formatStatusLabel(order.status)

	return (
		<div className='border border-gray-200 rounded-lg hover:border-emerald-300 transition-all bg-gradient-to-r from-white to-emerald-50'>
			<button
				onClick={onToggle}
				className='w-full p-4 flex flex-col sm:flex-row sm:items-center items-start justify-between gap-3'
			>
				<div className='flex items-center gap-4 flex-1 text-left w-full min-w-0'>
					<div
						className={`w-10 h-10 rounded-full flex items-center justify-center ${statusTone.icon}`}
					>
						<CheckCircle className='w-6 h-6' />
					</div>

					<div className='flex-1 min-w-0'>
						<div className='flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1'>
							<h4 className='text-sm font-bold text-gray-900 truncate'>#{order.orderNumber}</h4>
							<span className='text-xs text-gray-500 flex items-center'>
								<Clock className='w-3 h-3 mr-1' />
								{deliveryDate.toLocaleDateString('uz-UZ', {
									day: 'numeric',
									month: 'short',
									hour: '2-digit',
									minute: '2-digit',
								})}
							</span>
							<span className={`text-xs border rounded-full px-2 py-0.5 w-fit ${statusTone.badge}`}>
								{statusLabel}
							</span>
						</div>
						<p className='text-xs text-gray-600 truncate'>{order.user.name}</p>
					</div>

					<div className='text-left sm:text-right'>
						<p className={`text-lg font-bold ${statusTone.accent}`}>
							{order.totalPrice.toLocaleString()}
						</p>
						<p className='text-xs text-gray-500'>so&apos;m</p>
					</div>
				</div>

				{expanded ? (
					<ChevronUp className='w-5 h-5 text-gray-400 ml-4' />
				) : (
					<ChevronDown className='w-5 h-5 text-gray-400 ml-4' />
				)}
			</button>

			{expanded && (
				<div className='px-4 pb-4 border-t border-gray-100 pt-4 space-y-2'>
					<div className='flex items-center text-sm text-gray-700'>
						<PhoneCall className='w-4 h-4 mr-2 text-gray-400' />
						<a href={`tel:${order.user.phone}`} className='text-blue-600 hover:underline'>
							{order.user.phone}
						</a>
					</div>

					<div className='flex items-start text-sm text-gray-700'>
						<MapPin className='w-4 h-4 mr-2 text-gray-400 mt-0.5' />
						<span>{order.deliveryAddress}</span>
					</div>

					{order.deliveryInstructions && (
						<div className='p-3 bg-yellow-50 border border-yellow-200 rounded-lg'>
							<p className='text-sm text-yellow-800'>
								<strong>Izoh:</strong> {order.deliveryInstructions}
							</p>
						</div>
					)}

					<div className='pt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-gray-500'>
						<span>Yaratilgan: {new Date(order.createdAt).toLocaleString('uz-UZ')}</span>
						<span className={`font-medium ${statusTone.accent}`}>{statusLabel}</span>
					</div>
				</div>
			)}
		</div>
	)
}
