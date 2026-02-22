// frontend/app/(shop)/checkout/success/page.tsx
// ✅ BUYURTMA QABUL QILINDI – xabar, Menuga qaytish, Kuzatib borish

'use client'

import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useCartStore } from '@/store/cartStore'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { CheckCircle2, Home, MapPin } from 'lucide-react'

const TRACKING_LOCATION_KEY = 'tracking_user_location'

export default function CheckoutSuccessPage() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const clearCart = useCartStore(state => state.clearCart)
	const orderId = searchParams.get('orderId')
	const orderNumber = searchParams.get('orderNumber')
	const isPaid = searchParams.get('paid') === '1'
	const [locationRequesting, setLocationRequesting] = useState(false)

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

							<div className='flex flex-col gap-3 sm:flex-row sm:justify-center'>
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
