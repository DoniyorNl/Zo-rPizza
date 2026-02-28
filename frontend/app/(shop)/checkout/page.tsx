// frontend/app/(shop)/checkout/page.tsx
// 💳 CHECKOUT PAGE

'use client'

import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import api from '@/lib/api'
import { useAuth } from '@/lib/AuthContext'
import { geocodeAddress } from '@/lib/geocoding'
import { useCartStore } from '@/store/cartStore'
import { useDeliveryStore } from '@/store/deliveryStore'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import axios from 'axios'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'

// Stripe to'lov formasi (wallet + karta)
function CardPaymentForm({
	orderId,
	orderNumber,
	totalAmount,
	onClose,
	onSuccess,
}: {
	orderId: string
	orderNumber: string
	totalAmount: number
	onClose: () => void
	onSuccess: () => void
}) {
	const stripe = useStripe()
	const elements = useElements()
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')

	const handlePay = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!stripe || !elements) return
		setError('')
		setLoading(true)
		try {
			const origin = typeof window !== 'undefined' ? window.location.origin : ''
			const returnUrl = `${origin}/checkout/success?orderId=${orderId}&orderNumber=${encodeURIComponent(orderNumber)}&paid=1`
			const { error: confirmError } = await stripe.confirmPayment({
				elements,
				confirmParams: { return_url: returnUrl },
			})
			if (confirmError) {
				setError(confirmError.message ?? 'To\'lov amalga oshmadi')
				setLoading(false)
				return
			}
			onSuccess()
		} catch {
			setError('To\'lov amalga oshmadi')
		} finally {
			setLoading(false)
		}
	}

	return (
		<form onSubmit={handlePay} className="space-y-6 pb-2">
			<div className="rounded-lg bg-orange-50 border border-orange-200 p-3">
				<p className="text-sm text-orange-800">
					Buyurtma: <span className="font-semibold">{orderNumber || orderId}</span>
				</p>
				<p className="text-sm text-orange-800">
					Jami: <span className="font-semibold">{totalAmount.toLocaleString()} so&apos;m</span>
				</p>
			</div>
			<p className="text-sm text-gray-600">
				Qo&apos;llab-quvvatlanadigan qurilmalarda Google Pay avtomatik ko&apos;rinadi. Aks holda karta raqami orqali to&apos;lang.
			</p>
			<PaymentElement />
			{error && <div className="bg-red-50 text-red-600 p-3 rounded text-sm">{error}</div>}
			<div className="flex gap-3 sticky bottom-0 bg-white pt-2">
				<Button type="button" variant="outline" onClick={onClose} disabled={loading}>
					Yopish
				</Button>
				<Button type="submit" disabled={!stripe || loading}>
					{loading ? 'To\'lanmoqda...' : 'To\'lash'}
				</Button>
			</div>
		</form>
	)
}

export default function CheckoutPage() {
	const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
	const { items, getTotalPrice, clearCart } = useCartStore()
	const { method, selectedBranch } = useDeliveryStore()
	const { user } = useAuth()
	const router = useRouter()
	const afterSuccessRef = useRef(false)

	const [deliveryAddress, setDeliveryAddress] = useState('')
	const [deliveryPhone, setDeliveryPhone] = useState('')
	const [email, setEmail] = useState(user?.email || '')
	const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD'>('CASH')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const [preparingCardPayment, setPreparingCardPayment] = useState(false)
	// Stripe: buyurtma yaratilgach modal ochiladi
	const [cardStep, setCardStep] = useState<{ orderId: string; orderNumber: string; clientSecret: string; totalAmount: number } | null>(null)
	// Stripe modal uchun promise
	const stripePromise = useMemo(
		() => (stripePublishableKey ? loadStripe(stripePublishableKey) : null),
		[stripePublishableKey],
	)

	const isPickup = method === 'pickup'
	const canSubmitPickup = isPickup ? !!selectedBranch : true
	const effectiveAddress = isPickup && selectedBranch ? selectedBranch.address : deliveryAddress

	// Cart bo'sh yoki user yo'q bo'lsa cart/login ga – lekin buyurtma muvaffaqiyatli bo'lgach emas
	useEffect(() => {
		if (afterSuccessRef.current) return
		if (items.length === 0) {
			router.push('/cart')
		} else if (!user) {
			router.push('/login')
		}
	}, [items.length, user, router])

	useEffect(() => {
		const onEsc = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && cardStep) {
				if (window.confirm('To\'lov modalini yopmoqchimisiz?')) {
					setCardStep(null)
				}
			}
		}
		window.addEventListener('keydown', onEsc)
		return () => window.removeEventListener('keydown', onEsc)
	}, [cardStep])

	// Agar yo'q bo'lsa, loading ko'rsatish
	if (items.length === 0 || !user) {
		return (
			<main className='min-h-screen bg-gradient-to-b from-orange-50 to-white'>
				<Header />
				<div className='container mx-auto px-4 py-12 text-center'>
					<p className='text-xl'>Yuklanmoqda...</p>
				</div>
			</main>
		)
	}

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
					//
				}
			} else if (selectedBranch) {
				deliveryLat = selectedBranch.lat
				deliveryLng = selectedBranch.lng
			}

			const token = await user.getIdToken()

			const orderData: Record<string, unknown> = {
				userId: user.uid,
				email: email || user.email,
				name: user.displayName || 'User',
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
			if (deliveryLat != null && deliveryLng != null) {
				orderData.deliveryLat = deliveryLat
				orderData.deliveryLng = deliveryLng
			}
			if (isPickup && selectedBranch) {
				orderData.branchId = selectedBranch.id
			}

			const response = await api.post('/api/orders', orderData, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})

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
				const intentRes = await api.post(
					'/api/payment/create-intent',
					{ orderId: id },
					{ headers: { Authorization: `Bearer ${token}` } },
				)
				const clientSecret = intentRes.data?.data?.clientSecret
				if (!clientSecret) {
					throw new Error('Karta to\'lovi uchun clientSecret olinmadi')
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

			// Naqd: success ga yo'naltirish
			router.push(`/checkout/success?orderId=${id}&orderNumber=${encodeURIComponent(orderNumber)}`)
			clearCart()
		} catch (err: unknown) {
			if (axios.isAxiosError(err)) {
				setError(err.response?.data?.message || 'Buyurtma berishda xatolik')
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
								<CardTitle>
									{isPickup ? 'Olib ketish ma\'lumotlari' : 'Yetkazib berish ma\'lumotlari'}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<form data-testid="checkout-form" onSubmit={handleSubmit} className='space-y-6'>
									{error && <div data-testid="checkout-error" className='bg-red-50 text-red-600 p-3 rounded'>{error}</div>}

									{isPickup && selectedBranch && (
										<div className='rounded-lg bg-gray-100 p-4'>
											<p className='font-semibold text-gray-800'>{selectedBranch.name}</p>
											<p className='text-sm text-gray-600 mt-1'>{selectedBranch.address}</p>
											{selectedBranch.phone && (
												<p className='text-sm text-gray-600'>{selectedBranch.phone}</p>
											)}
										</div>
									)}

									{/* Manzil – faqat yetkazib berishda */}
									{!isPickup && (
										<div>
											<label className='block text-sm font-medium mb-2'>
												Yetkazib berish manzili *
											</label>
											<textarea
												data-testid="checkout-address"
												value={deliveryAddress}
												onChange={e => setDeliveryAddress(e.target.value)}
												className='w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500'
												rows={3}
												placeholder='Masalan: Toshkent, Chilonzor 9-kvartal, 12-uy'
												required
											/>
										</div>
									)}

									{/* Email */}
									<div>
										<label className='block text-sm font-medium mb-2'>Email *</label>
										<input
											data-testid="checkout-email"
											type='email'
											value={email}
											onChange={e => setEmail(e.target.value)}
											className='w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500'
											placeholder='sizning@email.com'
											required
										/>
										<p className='text-xs text-gray-500 mt-1'>
											Buyurtma tasdiqnomasi bu email ga yuboriladi
										</p>
									</div>

									{/* Telefon */}
									<div>
										<label className='block text-sm font-medium mb-2'>Telefon raqam *</label>
										<input
											data-testid="checkout-phone"
											type='tel'
											value={deliveryPhone}
											onChange={e => setDeliveryPhone(e.target.value)}
											className='w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500'
											placeholder='+998901234567'
											required
										/>
										<p className='text-xs text-gray-500 mt-1'>
											SMS xabar bu raqamga yuboriladi
										</p>
									</div>

									{/* To&apos;lov usuli */}
									<div>
										<label className='block text-sm font-medium mb-2'>To&apos;lov usuli *</label>
										<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
											<button
												type='button'
												data-testid="payment-cash"
												onClick={() => setPaymentMethod('CASH')}
												className={`p-4 border-2 rounded-lg font-semibold transition-all ${paymentMethod === 'CASH'
													? 'border-orange-600 bg-orange-50 text-orange-600'
													: 'border-gray-300 hover:border-orange-300'
													}`}
											>
												💵 Naqd pul
											</button>
											<button
												type='button'
												data-testid="payment-card"
												onClick={() => setPaymentMethod('CARD')}
												className={`p-4 border-2 rounded-lg font-semibold transition-all ${paymentMethod === 'CARD'
													? 'border-orange-600 bg-orange-50 text-orange-600'
													: 'border-gray-300 hover:border-orange-300'
													}`}
											>
												💳 Karta
											</button>
										</div>
									</div>

									<Button
										data-testid="checkout-submit"
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

					{/* Order Summary */}
					<div>
						<Card>
							<CardHeader>
								<CardTitle>Buyurtma tafsilotlari</CardTitle>
							</CardHeader>
							<CardContent className='space-y-4' data-testid="checkout-summary">
								{/* Items */}
								<div className='space-y-2'>
									{items.map(item => (
										<div key={item.id} className='flex justify-between text-sm'>
											<span>
												{item.name} x{item.quantity}
											</span>
											<span className='font-semibold'>
												{(item.price * item.quantity).toLocaleString()} so&apos;m
											</span>
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
			{cardStep && stripePromise && (
				<div
					className='fixed inset-0 z-50 bg-black/60 p-2 sm:p-4 flex items-end sm:items-center justify-center'
					onClick={() => {
						if (window.confirm('To\'lov modalini yopmoqchimisiz?')) setCardStep(null)
					}}
				>
					<Card
						className='w-full max-w-2xl h-[92vh] sm:h-auto sm:max-h-[92vh] overflow-hidden flex flex-col rounded-2xl'
						onClick={e => e.stopPropagation()}
					>
						<CardHeader className='border-b shrink-0'>
							<div className='flex items-center justify-between gap-2'>
								<div>
									<CardTitle>Karta orqali to&apos;lash</CardTitle>
									<p className='text-xs text-gray-500 mt-1'>Xavfsiz Stripe checkout</p>
								</div>
								<Button
									type='button'
									variant='outline'
									onClick={() => {
										if (window.confirm('To\'lov modalini yopmoqchimisiz?')) setCardStep(null)
									}}
								>
									✕
								</Button>
							</div>
						</CardHeader>
						<CardContent className='space-y-4 pt-5 overflow-y-auto'>
							<Elements
								stripe={stripePromise}
								options={{
									clientSecret: cardStep.clientSecret,
									appearance: {
										theme: 'stripe',
										variables: { colorPrimary: '#ea580c' },
									},
								}}
							>
								<CardPaymentForm
									orderId={cardStep.orderId}
									orderNumber={cardStep.orderNumber}
									totalAmount={cardStep.totalAmount}
									onClose={() => setCardStep(null)}
									onSuccess={() => {
										setCardStep(null)
										clearCart()
										router.push(`/checkout/success?orderId=${cardStep.orderId}&orderNumber=${encodeURIComponent(cardStep.orderNumber)}&paid=1`)
									}}
								/>
							</Elements>
						</CardContent>
					</Card>
				</div>
			)}
		</main>
	)
}
