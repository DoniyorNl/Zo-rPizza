// frontend/app/(shop)/checkout/success/page.tsx
// ✅ BUYURTMA QABUL QILINDI – Suspense wrapper for useSearchParams (Next 16)

import { Suspense } from 'react'
import CheckoutSuccessClient from './success-client'

export default function CheckoutSuccessPage() {
	return (
		<Suspense
			fallback={
				<main className='min-h-screen bg-gradient-to-b from-orange-50 to-white'>
					<div className='container mx-auto px-4 py-12 text-center'>
						<p className='text-xl'>Yuklanmoqda...</p>
					</div>
				</main>
			}
		>
			<CheckoutSuccessClient />
		</Suspense>
	)
}
