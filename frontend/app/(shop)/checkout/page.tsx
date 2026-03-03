// frontend/app/(shop)/checkout/page.tsx
// 💳 CHECKOUT PAGE

'use client'

import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/store/cartStore'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const CheckoutForm = dynamic(() => import('./checkout-form'), {
	ssr: false,
	loading: () => (
		<main className='min-h-screen bg-gradient-to-b from-orange-50 to-white'>
			<Header />
			<div className='container mx-auto px-4 py-12 text-center'>
				<p className='text-xl'>Yuklanmoqda...</p>
			</div>
		</main>
	),
})

export default function CheckoutPage() {
	const itemCount = useCartStore(state => state.items.length)
	const [hydrated, setHydrated] = useState(false)

	useEffect(() => {
		setHydrated(true)
	}, [])

	// Avoid SSR/client mismatch from persisted cart (localStorage).
	// Show a fast skeleton until hydration completes.
	if (!hydrated) {
		return (
			<main className='min-h-screen bg-gradient-to-b from-orange-50 to-white'>
				<Header />
				<div className='container mx-auto px-4 py-12'>
					<div className='max-w-3xl mx-auto'>
						<div className='h-10 w-64 bg-gray-200 rounded mb-6 animate-pulse' />
						<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
							<div className='lg:col-span-2 space-y-4'>
								<div className='h-56 bg-white rounded-xl border animate-pulse' />
								<div className='h-56 bg-white rounded-xl border animate-pulse' />
							</div>
							<div className='h-80 bg-white rounded-xl border animate-pulse' />
						</div>
					</div>
				</div>
			</main>
		)
	}

	if (itemCount === 0) {
		return (
			<main className='min-h-screen bg-gradient-to-b from-orange-50 to-white'>
				<Header />
				<div className='container mx-auto px-4 py-12 text-center'>
					<h1 className='text-3xl font-bold mb-3'>Savatcha bo&apos;sh</h1>
					<p className='text-gray-600 mb-8'>Buyurtma berish uchun avval mahsulot qo&apos;shing.</p>
					<div className='flex items-center justify-center gap-3'>
						<Button asChild variant='outline'>
							<Link href='/menu'>Menyuga o&apos;tish</Link>
						</Button>
						<Button asChild>
							<Link href='/cart'>Savatchani ko&apos;rish</Link>
						</Button>
					</div>
				</div>
			</main>
		)
	}
	return <CheckoutForm />
}
