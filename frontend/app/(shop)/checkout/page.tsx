// frontend/app/(shop)/checkout/page.tsx
// 💳 CHECKOUT PAGE

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cartStore'
import { useAuth } from '@/lib/AuthContext'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import axios from 'axios'

export default function CheckoutPage() {
	const { items, getTotalPrice, clearCart } = useCartStore()
	const { user } = useAuth()
	const router = useRouter()

	const [deliveryAddress, setDeliveryAddress] = useState('')
	const [deliveryPhone, setDeliveryPhone] = useState('')
	const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD'>('CASH')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')

	// Redirect agar cart bo'sh yoki user yo'q
	useEffect(() => {
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
			// Buyurtma yaratish
			const orderData = {
				userId: user.uid,
				items: items.map(item => ({
					productId: item.productId,
					variationId: item.variationId,
					size: item.size,
					quantity: item.quantity,
				})),
				paymentMethod,
				deliveryAddress,
				deliveryPhone,
			}

			const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, orderData)

			// Muvaffaqiyatli - cart tozalash
			clearCart()

			// Success page'ga yo'naltirish (yoki orders page)
			alert(`Buyurtma muvaffaqiyatli! Order ${response.data.data.orderNumber}`)
			router.push('/')
		} catch (err: any) {
			setError(err.response?.data?.message || 'Buyurtma berishda xatolik')
		} finally {
			setLoading(false)
		}
	}

	return (
		<main className='min-h-screen bg-gradient-to-b from-orange-50 to-white'>
			<Header />

			<div className='container mx-auto px-4 py-12'>
				<h1 className='text-4xl font-bold mb-8'>Buyurtma berish</h1>

				<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
					{/* Form */}
					<div className='lg:col-span-2'>
						<Card>
							<CardHeader>
								<CardTitle>Yetkazib berish ma'lumotlari</CardTitle>
							</CardHeader>
							<CardContent>
								<form onSubmit={handleSubmit} className='space-y-6'>
									{error && <div className='bg-red-50 text-red-600 p-3 rounded'>{error}</div>}

									{/* Manzil */}
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

									{/* To'lov usuli */}
									<div>
										<label className='block text-sm font-medium mb-2'>To'lov usuli *</label>
										<div className='grid grid-cols-2 gap-4'>
											<button
												type='button'
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

									{/* Submit */}
									<Button type='submit' className='w-full' size='lg' disabled={loading}>
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
												{(item.price * item.quantity).toLocaleString()} so'm
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
										<span className='text-orange-600'>{getTotalPrice().toLocaleString()} so'm</span>
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
