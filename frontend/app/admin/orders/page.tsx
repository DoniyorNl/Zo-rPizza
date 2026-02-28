// frontend/app/admin/orders/page.tsx
'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/lib/apiClient'
import { useAuth } from '@/lib/AuthContext'
import axios from 'axios'
import { format } from 'date-fns'
import { Download } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

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
	const [statusFilter, setStatusFilter] = useState('ALL')
	const [driverFilter, setDriverFilter] = useState('ALL')
	const [dateRange, setDateRange] = useState<{ from: string; to: string }>({ from: '', to: '' })
	const driverById = useMemo(() => new Map(drivers.map(driver => [driver.id, driver])), [drivers])
	const statusOptions = useMemo(
		() => Array.from(new Set(orders.map(order => order.status))).sort(),
		[orders],
	)
	const hasActiveFilters =
		statusFilter !== 'ALL' || driverFilter !== 'ALL' || Boolean(dateRange.from || dateRange.to)
	const filteredOrders = useMemo(() => {
		const statusFiltered =
			statusFilter === 'ALL' ? orders : orders.filter(order => order.status === statusFilter)
		const driverFiltered =
			driverFilter === 'ALL'
				? statusFiltered
				: statusFiltered.filter(order => (order.driverId || 'UNASSIGNED') === driverFilter)
		const hasCustomRange = Boolean(dateRange.from || dateRange.to)
		if (!hasCustomRange) return driverFiltered
		const fromDate = dateRange.from ? new Date(`${dateRange.from}T00:00:00`) : null
		const toDate = dateRange.to ? new Date(`${dateRange.to}T23:59:59`) : null
		return driverFiltered.filter(order => {
			const createdAt = new Date(order.createdAt)
			if (fromDate && createdAt < fromDate) return false
			if (toDate && createdAt > toDate) return false
			return true
		})
	}, [orders, statusFilter, driverFilter, dateRange])

	function formatDateValue(value: string) {
		if (!value) return ''
		const parsed = new Date(`${value}T00:00:00`)
		if (Number.isNaN(parsed.getTime())) return value
		return parsed.toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short' })
	}

	function resetFilters() {
		setStatusFilter('ALL')
		setDriverFilter('ALL')
		setDateRange({ from: '', to: '' })
	}

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
		deliveryLng?: number,
	) => {
		try {
			const payload: Record<string, unknown> = { status: newStatus }
			if (driverId) payload.driverId = driverId
			if (deliveryLat != null) payload.deliveryLat = deliveryLat
			if (deliveryLng != null) payload.deliveryLng = deliveryLng

			await api.patch(`/api/orders/admin/${orderId}/status`, payload, {
				headers: { 'x-user-id': user?.uid },
			})

			setOrders(orders.map(o => (o.id === orderId ? { ...o, status: newStatus, driverId } : o)))
		} catch (err: unknown) {
			const msg = axios.isAxiosError(err)
				? err.response?.data?.message || "Status o'zgartirib bo'lmadi"
				: "Status o'zgartirib bo'lmadi"
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

	function getDriverLabel(driverId?: string | null) {
		if (!driverId) return 'N/A'
		const driver = driverById.get(driverId)
		if (!driver) return driverId
		return driver.name || driver.email
	}

	function handleCsvExport() {
		if (filteredOrders.length === 0) return
		const headers = [
			'OrderNumber',
			'Status',
			'Customer',
			'CustomerEmail',
			'DeliveryPhone',
			'Address',
			'Driver',
			'CreatedAt',
			'TotalPrice',
		]

		const rows = filteredOrders.map(order => [
			csvEscape(order.orderNumber),
			csvEscape(order.status),
			csvEscape(order.user.name || 'N/A'),
			csvEscape(order.user.email || 'N/A'),
			csvEscape(order.deliveryPhone || 'N/A'),
			csvEscape(order.deliveryAddress || 'N/A'),
			csvEscape(getDriverLabel(order.driverId)),
			csvEscape(new Date(order.createdAt).toISOString()),
			csvEscape(order.totalPrice.toString()),
		])

		const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
		const url = URL.createObjectURL(blob)
		const link = document.createElement('a')
		link.href = url
		link.download = `admin-orders-${new Date().toISOString().slice(0, 10)}.csv`
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
		URL.revokeObjectURL(url)
	}

	function handlePdfExport() {
		if (filteredOrders.length === 0) return
		const now = new Date()
		const rowsHtml = filteredOrders
			.map(order => {
				return `
					<tr>
						<td>${escapeHtml(order.orderNumber)}</td>
						<td>${escapeHtml(order.status)}</td>
						<td>${escapeHtml(order.user.name || 'N/A')}</td>
						<td>${escapeHtml(order.user.email || 'N/A')}</td>
						<td>${escapeHtml(order.deliveryPhone || 'N/A')}</td>
						<td>${escapeHtml(order.deliveryAddress || 'N/A')}</td>
						<td>${escapeHtml(getDriverLabel(order.driverId))}</td>
						<td>${escapeHtml(new Date(order.createdAt).toLocaleString('uz-UZ'))}</td>
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
				<title>Admin Orders Export</title>
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
				<h1>Buyurtmalar ro'yxati</h1>
				<div class="meta">
					<div>Eksport vaqti: ${escapeHtml(now.toLocaleString('uz-UZ'))}</div>
					<div>Jami buyurtma: ${filteredOrders.length} ta</div>
				</div>
				<table>
					<thead>
						<tr>
							<th>Buyurtma #</th>
							<th>Status</th>
							<th>Mijoz</th>
							<th>Email</th>
							<th>Telefon</th>
							<th>Manzil</th>
							<th>Driver</th>
							<th>Yaratilgan</th>
							<th>Summa</th>
						</tr>
					</thead>
					<tbody>
						${rowsHtml}
					</tbody>
					<tfoot>
						<tr>
							<td colspan="8">Jami</td>
							<td>${escapeHtml(
								filteredOrders.reduce((sum, order) => sum + order.totalPrice, 0).toLocaleString(),
							)} so'm</td>
						</tr>
					</tfoot>
				</table>
			</body>
			</html>
		`

		const printWindow = window.open('', '_blank', 'width=1100,height=800')
		if (!printWindow) return
		printWindow.document.open()
		printWindow.document.write(html)
		printWindow.document.close()
		printWindow.focus()
		printWindow.print()
	}

	if (loading) {
		return <div className='text-center py-12'>Yuklanmoqda...</div>
	}

	if (error) {
		return <div className='text-center py-12 text-red-600'>{error}</div>
	}

	return (
		<div>
			<div className='mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
				<div>
					<h1 className='text-3xl font-bold mb-2'>Buyurtmalar</h1>
					<p className='text-gray-600'>Jami: {filteredOrders.length} ta</p>
				</div>
				<div className='flex flex-wrap gap-2'>
					<Button
						onClick={handlePdfExport}
						disabled={filteredOrders.length === 0}
						variant='outline'
						className='flex items-center gap-2'
					>
						<Download className='w-4 h-4' />
						PDF Export
					</Button>
					<Button
						onClick={handleCsvExport}
						disabled={filteredOrders.length === 0}
						variant='outline'
						className='flex items-center gap-2'
					>
						<Download className='w-4 h-4' />
						Excel (CSV)
					</Button>
				</div>
			</div>

			<div className='mb-6 rounded-xl border border-gray-200 bg-white p-4'>
				<div className='grid gap-4 md:grid-cols-4'>
					<div>
						<label className='mb-2 block text-sm font-medium text-gray-700'>Status</label>
						<select
							value={statusFilter}
							onChange={event => setStatusFilter(event.target.value)}
							className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm'
						>
							<option value='ALL'>Barchasi</option>
							{statusOptions.map(status => (
								<option key={status} value={status}>
									{status}
								</option>
							))}
						</select>
					</div>
					<div>
						<label className='mb-2 block text-sm font-medium text-gray-700'>Driver</label>
						<select
							value={driverFilter}
							onChange={event => setDriverFilter(event.target.value)}
							className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm'
						>
							<option value='ALL'>Barchasi</option>
							<option value='UNASSIGNED'>Haydovchisiz</option>
							{drivers.map(driver => (
								<option key={driver.id} value={driver.id}>
									{driver.name || driver.email}
								</option>
							))}
						</select>
					</div>
					<div>
						<label className='mb-2 block text-sm font-medium text-gray-700'>Boshlanish sana</label>
						<input
							type='date'
							value={dateRange.from}
							onChange={event => setDateRange(prev => ({ ...prev, from: event.target.value }))}
							className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm'
						/>
					</div>
					<div>
						<label className='mb-2 block text-sm font-medium text-gray-700'>Tugash sana</label>
						<input
							type='date'
							value={dateRange.to}
							onChange={event => setDateRange(prev => ({ ...prev, to: event.target.value }))}
							className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm'
						/>
					</div>
				</div>
				<div className='mt-4 flex flex-wrap items-center gap-2 text-xs text-gray-600'>
					<span className='rounded-full border border-gray-200 bg-gray-50 px-3 py-1'>
						Status: {statusFilter === 'ALL' ? 'Barchasi' : statusFilter}
					</span>
					<span className='rounded-full border border-gray-200 bg-gray-50 px-3 py-1'>
						Driver: {driverFilter === 'ALL' ? 'Barchasi' : getDriverLabel(driverFilter)}
					</span>
					{(dateRange.from || dateRange.to) && (
						<span className='rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700'>
							Sana: {formatDateValue(dateRange.from) || '...'} -{' '}
							{formatDateValue(dateRange.to) || '...'}
						</span>
					)}
					{hasActiveFilters && (
						<Button variant='outline' size='sm' onClick={resetFilters}>
							Filterlarni tozalash
						</Button>
					)}
				</div>
			</div>

			<div className='space-y-4'>
				{filteredOrders.map(order => (
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
															selectedDriverForOrder[order.id] || undefined,
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
												Xaritada ko&apos;rish →
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
