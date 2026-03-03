'use client'

import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import api from '@/lib/api'
import { useAuth } from '@/lib/AuthContext'
import { geocodeAddress } from '@/lib/geocoding'
import { calculateETA, formatETA, getETADescription } from '@/lib/etaCalculation'
import { useCartStore } from '@/store/cartStore'
import { useDeliveryStore } from '@/store/deliveryStore'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'

type CardStep = {
	orderId: string
	orderNumber: string
	clientSecret: string
	totalAmount: number
}

const StripePaymentModal = dynamic(() => import('./stripe-payment-modal'), { ssr: false })

export default function CheckoutForm() {
	const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
	const { items, getTotalPrice, clearCart } = useCartStore()
	const { method, selectedBranch } = useDeliveryStore()
	const { user } = useAuth()
	const router = useRouter()
	const afterSuccessRef = useRef(false)

	const [deliveryAddress, setDeliveryAddress] = useState('')
	const [deliveryPhone, setDeliveryPhone] = useState('')
	const [email, setEmail] = useState(user?.email || '')
	const [guestName, setGuestName] = useState('')
	const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD'>('CASH')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const [preparingCardPayment, setPreparingCardPayment] = useState(false)
	const [cardStep, setCardStep] = useState<CardStep | null>(null)

	const isPickup = method === 'pickup'
	const canSubmitPickup = isPickup ? !!selectedBranch : true
	const effectiveAddress = isPickup && selectedBranch ? selectedBranch.address : deliveryAddress

	// ETA
	const eta = useMemo(() => {
		return calculateETA({
			distance: 3,
			productCount: items.length,
			hasComplexItems: items.some(item => item.addedToppingIds?.length > 0 || item.halfProductId),
		})
	}, [items])

	useEffect(() => {
		const onEsc = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && cardStep) {
				if (window.confirm("To'lov modalini yopmoqchimisiz?")) {
					setCardStep(null)
				}
			}
		}
		window.addEventListener('keydown', onEsc)
		return () => window.removeEventListener('keydown', onEsc)
	}, [cardStep])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError('')
		setLoading(true)

		try {
			let deliveryLat: number | undefined
			let deliveryLng: number | undefined
			const addressToGeocode = isPickup && selectedBranch ? selectedBranch.address : deliveryAddress

			if (!isPickup) {
				try {
					const coords = await geocodeAddress(addressToGeocode)
					if (coords) {
						deliveryLat = coords.lat
						deliveryLng = coords.lng
					}
				} catch {
					// ignore geocode errors
				}
			} else if (selectedBranch) {
				deliveryLat = selectedBranch.lat
				deliveryLng = selectedBranch.lng
			}

			let token: string | undefined
			if (user) token = await user.getIdToken()

			const orderData: Record<string, unknown> = {
				items: items.map(item => ({
					productId: item.productId,
					variationId: item.variationId,
					size: item.size,
					quantity: item.quantity,
					addedToppingIds: item.addedToppingIds,
					removedToppingIds: item.removedToppingIds,
					halfProductId: item.halfProductId,
				})),
				paymentMethod,
				deliveryType: method,
				deliveryAddress: effectiveAddress,
				deliveryPhone,
			}

			if (user) {
				orderData.userId = user.uid
				orderData.email = email || user.email
				orderData.name = user.displayName || 'User'
			} else {
				orderData.name = guestName
				orderData.email = email
				orderData.customerName = guestName
				orderData.customerEmail = email
				orderData.customerPhone = deliveryPhone
			}

			if (deliveryLat != null && deliveryLng != null) {
				orderData.deliveryLat = deliveryLat
				orderData.deliveryLng = deliveryLng
			}
			if (isPickup && selectedBranch) {
				orderData.branchId = selectedBranch.id
			}

			const headers: Record<string, string> = {}
			if (token) headers.Authorization = `Bearer ${token}`

			const response = await api.post('/api/orders', orderData, { headers })
			const order = response.data?.data
			const id = order?.id
			const orderNumber = order?.orderNumber ?? ''
			afterSuccessRef.current = true

			if (!id) {
				router.push('/')
				return
			}

			if (paymentMethod === 'CARD') {
				if (!stripePublishableKey) {
					throw new Error('Stripe sozlanmagan. NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY tekshiring.')
				}
				setPreparingCardPayment(true)
				const intentRes = await api.post('/api/payment/create-intent', { orderId: id }, { headers })
				const clientSecret = intentRes.data?.data?.clientSecret
				if (!clientSecret) {
					throw new Error("Karta to'lovi uchun clientSecret olinmadi")
				}
				afterSuccessRef.current = true
				setCardStep({
					orderId: id,
					orderNumber,
					clientSecret,
					totalAmount: Number(order?.totalPrice ?? getTotalPrice()),
				})
				return
			}

			router.push(`/checkout/success?orderId=${id}&orderNumber=${encodeURIComponent(orderNumber)}`)
			clearCart()
		} catch (err: unknown) {
			const responseMessage =
				typeof (err as { response?: { data?: { message?: unknown } } })?.response?.data?.message === 'string'
					? (err as { response: { data: { message: string } } }).response.data.message
					: null
			if (responseMessage) {
				setError(responseMessage)
			} else if (err instanceof Error) {
				setError(err.message)
			} else {
				setError('Buyurtma berishda xatolik')
			}
		} finally {
			setLoading(false)
			setPreparingCardPayment(false)
		}
	}

	return (
		<main className='min-h-screen bg-gradient-to-b from-orange-50 to-white'>
			<Header />

			<div className='container mx-auto px-4 py-12'>
				<h1 className='text-4xl font-bold mb-8'>Buyurtma berish</h1>

				{isPickup && !selectedBranch && (
					<Card className='mb-8 border-amber-200 bg-amber-50'>
						<CardContent className='pt-6'>
							<p className='text-amber-800 font-medium mb-2'>
								Olib ketish uchun bosh sahifada &quot;Olib ketish&quot; va do&apos;konni tanlang.
							</p>
							<Button asChild variant='outline' className='border-amber-600 text-amber-800'>
								<Link href='/'>Bosh sahifaga o&apos;tish</Link>
							</Button>
						</CardContent>
					</Card>
				)}

				<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
					<div className='lg:col-span-2'>
						<Card>
							<CardHeader>
								<CardTitle>{isPickup ? "Olib ketish ma'lumotlari" : "Yetkazib berish ma'lumotlari"}</CardTitle>
							</CardHeader>
							<CardContent>
								<form data-testid='checkout-form' onSubmit={handleSubmit} className='space-y-6'>
									{error && (
										<div data-testid='checkout-error' className='bg-red-50 text-red-600 p-3 rounded'>
											{error}
										</div>
									)}

									{!user && (
										<div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
											<p className='text-sm text-blue-800 mb-2'>
												<strong>Mehmon sifatida buyurtma berasiz</strong>
											</p>
											<p className='text-xs text-blue-700'>
												Akkaunt yaratish uchun{' '}
												<Link href='/register' className='underline font-semibold'>
													ro&apos;yxatdan o&apos;ting
												</Link>{' '}
												yoki{' '}
												<Link href='/login' className='underline font-semibold'>
													kirish
												</Link>
											</p>
										</div>
									)}

									{!user && (
										<div>
											<label className='block text-sm font-medium mb-2'>Ismingiz *</label>
											<input
												type='text'
												value={guestName}
												onChange={e => setGuestName(e.target.value)}
												className='w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500'
												placeholder='Masalan: Alisher Navoi'
												required
											/>
										</div>
									)}

									{isPickup && selectedBranch && (
										<div className='rounded-lg bg-gray-100 p-4'>
											<p className='font-semibold text-gray-800'>{selectedBranch.name}</p>
											<p className='text-sm text-gray-600 mt-1'>{selectedBranch.address}</p>
											{selectedBranch.phone && <p className='text-sm text-gray-600'>{selectedBranch.phone}</p>}
										</div>
									)}

									{!isPickup && (
										<div>
											<label className='block text-sm font-medium mb-2'>Yetkazib berish manzili *</label>
											<textarea
												data-testid='checkout-address'
												value={deliveryAddress}
												onChange={e => setDeliveryAddress(e.target.value)}
												className='w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500'
												rows={3}
												placeholder='Masalan: Toshkent, Chilonzor 9-kvartal, 12-uy'
												required
											/>
										</div>
									)}

									<div>
										<label className='block text-sm font-medium mb-2'>Email *</label>
										<input
											data-testid='checkout-email'
											type='email'
											value={email}
											onChange={e => setEmail(e.target.value)}
											className='w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500'
											placeholder='sizning@email.com'
											required
										/>
										<p className='text-xs text-gray-500 mt-1'>Buyurtma tasdiqnomasi bu email ga yuboriladi</p>
									</div>

									<div>
										<label className='block text-sm font-medium mb-2'>Telefon raqam *</label>
										<input
											data-testid='checkout-phone'
											type='tel'
											value={deliveryPhone}
											onChange={e => setDeliveryPhone(e.target.value)}
											className='w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500'
											placeholder='+998901234567'
											required
										/>
										<p className='text-xs text-gray-500 mt-1'>SMS xabar bu raqamga yuboriladi</p>
									</div>

									<div>
										<label className='block text-sm font-medium mb-2'>To&apos;lov usuli *</label>
										<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
											<button
												type='button'
												data-testid='payment-cash'
												onClick={() => setPaymentMethod('CASH')}
												className={`p-4 border-2 rounded-lg font-semibold transition-all ${
													paymentMethod === 'CASH'
														? 'border-orange-600 bg-orange-50 text-orange-600'
														: 'border-gray-300 hover:border-orange-300'
												}`}
											>
												💵 Naqd pul
											</button>
											<button
												type='button'
												data-testid='payment-card'
												onClick={() => setPaymentMethod('CARD')}
												className={`p-4 border-2 rounded-lg font-semibold transition-all ${
													paymentMethod === 'CARD'
														? 'border-orange-600 bg-orange-50 text-orange-600'
														: 'border-gray-300 hover:border-orange-300'
												}`}
											>
												💳 Karta
											</button>
										</div>
									</div>

									<Button
										data-testid='checkout-submit'
										type='submit'
										className='w-full'
										size='lg'
										disabled={loading || !canSubmitPickup}
									>
										{loading ? 'Yuklanmoqda...' : 'Buyurtma berish'}
									</Button>
								</form>
							</CardContent>
						</Card>
					</div>

					<div>
						<Card>
							<CardHeader>
								<CardTitle>Buyurtma tafsilotlari</CardTitle>
							</CardHeader>
							<CardContent className='space-y-4' data-testid='checkout-summary'>
								<div className='bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-4 border border-orange-200'>
									<div className='flex items-center gap-2 mb-2'>
										<span className='text-2xl'>⏱️</span>
										<div>
											<p className='font-semibold text-gray-800'>Taxminiy yetkazish vaqti</p>
											<p className='text-sm text-gray-600'>{getETADescription(eta)}</p>
										</div>
									</div>
									<div className='text-center mt-3'>
										<p className='text-3xl font-bold text-orange-600'>{formatETA(eta)}</p>
										<p className='text-xs text-gray-500 mt-1'>
											Tayyorlash: {eta.breakdown.prepTime} daqiqa • Yetkazish: {eta.breakdown.deliveryTime} daqiqa
										</p>
									</div>
								</div>

								<div className='space-y-2'>
									{items.map(item => (
										<div key={item.id} className='flex justify-between text-sm'>
											<span>
												{item.name} x{item.quantity}
											</span>
											<span className='font-semibold'>{(item.price * item.quantity).toLocaleString()} so&apos;m</span>
										</div>
									))}
								</div>

								<div className='border-t pt-4'>
									<div className='flex justify-between text-sm mb-2'>
										<span>Yetkazib berish:</span>
										<span className='text-green-600 font-semibold'>Bepul</span>
									</div>

									<div className='flex justify-between text-xl font-bold'>
										<span>Jami:</span>
										<span className='text-orange-600'>{getTotalPrice().toLocaleString()} so&apos;m</span>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>

			{preparingCardPayment && (
				<div className='fixed inset-0 z-50 bg-black/60 p-4 flex items-center justify-center'>
					<Card className='w-full max-w-md'>
						<CardContent className='pt-6'>
							<div className='flex items-center gap-3'>
								<div className='h-5 w-5 rounded-full border-2 border-orange-600 border-t-transparent animate-spin' />
								<p className='font-medium text-gray-800'>To&apos;lov oynasi tayyorlanmoqda...</p>
							</div>
						</CardContent>
					</Card>
				</div>
			)}

			{cardStep && stripePublishableKey && (
				<StripePaymentModal
					publishableKey={stripePublishableKey}
					cardStep={cardStep}
					onRequestClose={() => setCardStep(null)}
					onSuccess={() => {
						setCardStep(null)
						clearCart()
						router.push(
							`/checkout/success?orderId=${cardStep.orderId}&orderNumber=${encodeURIComponent(
								cardStep.orderNumber,
							)}&paid=1`,
						)
					}}
				/>
			)}
		</main>
	)
}

