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
import axios from 'axios'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export default function CheckoutPage() {
	const { items, getTotalPrice, clearCart } = useCartStore()
	const { method, selectedBranch } = useDeliveryStore()
	const { user } = useAuth()
	const router = useRouter()
	const afterSuccessRef = useRef(false)

	const [deliveryAddress, setDeliveryAddress] = useState('')
	const [deliveryPhone, setDeliveryPhone] = useState('')
	const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD'>('CASH')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')

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
			// Avval success ga yo'naltirish, keyin cart tozalash – aks holda useEffect cartga qaytarib yuboradi
			afterSuccessRef.current = true
			if (id) {
				router.push(`/checkout/success?orderId=${id}&orderNumber=${encodeURIComponent(orderNumber)}`)
			} else {
				router.push('/')
			}
			clearCart()
		} catch (err: unknown) {
			if (axios.isAxiosError(err)) {
				setError(err.response?.data?.message || 'Buyurtma berishda xatolik')
			} else {
				setError('Buyurtma berishda xatolik')
			}
		} finally {
			setLoading(false)
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
								<form onSubmit={handleSubmit} className='space-y-6'>
									{error && <div className='bg-red-50 text-red-600 p-3 rounded'>{error}</div>}

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
												value={deliveryAddress}
												onChange={e => setDeliveryAddress(e.target.value)}
												className='w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500'
												rows={3}
												placeholder='Masalan: Toshkent, Chilonzor 9-kvartal, 12-uy'
												required
											/>
										</div>
									)}

									{/* Telefon */}
									<div>
										<label className='block text-sm font-medium mb-2'>Telefon raqam *</label>
										<input
											type='tel'
											value={deliveryPhone}
											onChange={e => setDeliveryPhone(e.target.value)}
											className='w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500'
											placeholder='+998901234567'
											required
										/>
									</div>

									{/* To&apos;lov usuli */}
									<div>
										<label className='block text-sm font-medium mb-2'>To&apos;lov usuli *</label>
										<div className='grid grid-cols-2 gap-4'>
											<button
												type='button'
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
							<CardContent className='space-y-4'>
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
		</main>
	)
}
