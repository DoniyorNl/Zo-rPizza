// frontend/app/(shop)/checkout/success/page.tsx
// ✅ BUYURTMA QABUL QILINDI – xabar, Chek yuklash, Menuga qaytish, Kuzatib borish

'use client'

import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { api } from '@/lib/apiClient'
import { useAuth } from '@/lib/AuthContext'
import { useCartStore } from '@/store/cartStore'
import { trackPurchase } from '@/lib/analytics'
import { generateInvoice, type InvoiceData } from '@/lib/pdfInvoice'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { CheckCircle2, Download, Home, MapPin, Phone } from 'lucide-react'

const TRACKING_LOCATION_KEY = 'tracking_user_location'

const statusLabels: Record<string, string> = {
	PENDING: 'Kutilmoqda',
	PREPARING: 'Tayyorlanmoqda',
	DELIVERING: "Yetkazilmoqda",
	COMPLETED: 'Yetkazildi',
	CANCELLED: 'Bekor qilindi',
}

export default function CheckoutSuccessPage() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const { user } = useAuth()
	const clearCart = useCartStore(state => state.clearCart)
	const orderId = searchParams.get('orderId')
	const orderNumber = searchParams.get('orderNumber')
	const totalPrice = searchParams.get('total')
	const paymentMethod = searchParams.get('payment')
	const isPaid = searchParams.get('paid') === '1'
	const [locationRequesting, setLocationRequesting] = useState(false)
	const [tracked, setTracked] = useState(false)
	const [downloading, setDownloading] = useState(false)

	// Track purchase event (once)
	useEffect(() => {
		if (orderId && !tracked && totalPrice) {
			trackPurchase({
				orderId,
				orderNumber: orderNumber || orderId,
				totalPrice: parseFloat(totalPrice),
				paymentMethod: paymentMethod || 'CASH',
				items: [], // Items from order (can be enhanced)
			})
			setTracked(true)
		}
	}, [orderId, tracked, totalPrice, orderNumber, paymentMethod])

	// orderId bo'lmasa asosiy sahifaga (direct URL ochilganda)
	useEffect(() => {
		if (!orderId) {
			router.replace('/')
		}
	}, [orderId, router])

	useEffect(() => {
		// Online payment flow qaytganda savatni tozalaymiz
		if (isPaid) clearCart()
	}, [isPaid, clearCart])

	const handleDownloadInvoice = async () => {
		if (!orderId) return
		setDownloading(true)
		try {
			const response = await api.get(`/api/orders/${orderId}`)
			const order = response.data.data
			if (!order) {
				alert('Buyurtma ma\'lumotlari topilmadi')
				return
			}

			const invoiceData: InvoiceData = {
				orderNumber: order.orderNumber,
				orderDate: order.createdAt,
				customerName: user?.displayName ?? (order as { customerName?: string }).customerName ?? order.deliveryPhone ?? 'Mijoz',
				customerEmail: user?.email ?? (order as { customerEmail?: string }).customerEmail ?? undefined,
				customerPhone: order.deliveryPhone,
				deliveryAddress: order.deliveryAddress,
				items: order.items.map((item: { quantity: number; price: number; product: { name: string }; size?: string }) => ({
					name: item.product.name,
					quantity: item.quantity,
					size: item.size,
					price: item.price * item.quantity,
				})),
				subtotal: order.totalPrice,
				total: order.totalPrice,
				paymentMethod: order.paymentMethod,
				status: statusLabels[order.status] || order.status,
			}

			await generateInvoice(invoiceData)
		} catch (err) {
			console.error('Chek yuklash xatosi:', err)
			alert('Chekni yuklab olishda xatolik. Keyinroq "Mening buyurtmalarim" sahifasidan urinib ko\'ring.')
		} finally {
			setDownloading(false)
		}
	}

	if (!orderId) {
		return (
			<main className='min-h-screen bg-gradient-to-b from-orange-50 to-white'>
				<Header />
				<div className='container mx-auto px-4 py-12 text-center'>
					<p className='text-xl'>Yuklanmoqda...</p>
				</div>
			</main>
		)
	}

	return (
		<main className='min-h-screen bg-gradient-to-b from-orange-50 to-white'>
			<Header />

			<div className='container mx-auto px-4 py-12 max-w-lg mx-auto'>
				<Card className='border-2 border-green-200 shadow-lg'>
					<CardContent className='pt-8 pb-8'>
						<div className='text-center'>
							<div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-6'>
								<CheckCircle2 className='w-10 h-10' />
							</div>
							<h1 data-testid="checkout-success-title" className='text-2xl font-bold text-gray-900 mb-2'>
								Buyurtmangiz qabul qilindi
							</h1>
							<p className='text-gray-600 mb-1'>
								Buyurtma tayyorlanmoqda.
							</p>
							{orderNumber && (
								<p className='text-sm text-gray-500 mb-8'>
									Buyurtma raqami: <span className='font-semibold'>{orderNumber}</span>
								</p>
							)}
							{!orderNumber && <div className='mb-8' />}

							<div className='mb-6 p-3 bg-gray-50 rounded-lg border border-gray-200'>
								<p className='text-xs text-gray-500 mb-1'>Muammo yuzaga kelsa:</p>
								<a
									href='tel:+998901234567'
									className='flex items-center justify-center gap-2 text-orange-600 hover:text-orange-700 font-semibold transition-colors'
								>
									<Phone className='w-4 h-4' />
									<span>+998 90 123 45 67</span>
								</a>
							</div>

							<div className='flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center'>
								<Button
									size='lg'
									variant='default'
									className='gap-2 w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white border-0'
									disabled={downloading}
									onClick={handleDownloadInvoice}
								>
									<Download className='w-4 h-4 shrink-0' />
									{downloading ? 'Yuklanmoqda...' : 'Chekni yuklab olish'}
								</Button>
								<Button
									size='lg'
									variant='outline'
									className='gap-2 w-full sm:w-auto'
									onClick={() => router.push('/')}
								>
									<Home className='w-4 h-4 shrink-0' />
									Menuga qaytish
								</Button>
								<Button
									size='lg'
									variant='default'
									className='gap-2 w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white border-0'
									disabled={locationRequesting}
									onClick={() => {
										if (!orderId) return
										// Brauzerdan joylashuv so‘rash, keyin tracking sahifasiga o‘tish (xarita sizning joyingizni ko‘rsatadi)
										if (typeof navigator !== 'undefined' && navigator.geolocation) {
											setLocationRequesting(true)
											navigator.geolocation.getCurrentPosition(
												(pos) => {
													try {
														sessionStorage.setItem(
															TRACKING_LOCATION_KEY,
															JSON.stringify({
																lat: pos.coords.latitude,
																lng: pos.coords.longitude,
															}),
														)
													} catch {}
													setLocationRequesting(false)
													router.push(`/tracking/${orderId}`)
												},
												() => {
													setLocationRequesting(false)
													router.push(`/tracking/${orderId}`)
												},
												{ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
											)
										} else {
											router.push(`/tracking/${orderId}`)
										}
									}}
								>
									<MapPin className='w-4 h-4 shrink-0' />
									{locationRequesting ? 'Joylashuv so‘ralmoqda...' : 'Kuzatib borish'}
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</main>
	)
}
