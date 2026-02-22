// frontend/components/layout/Footer.tsx
'use client'

import { Phone } from 'lucide-react'

export function Footer() {
	return (
		<footer className='bg-gray-900 text-gray-300 py-8 mt-auto'>
			<div className='container mx-auto px-4'>
				<div className='flex flex-col md:flex-row items-center justify-between gap-4'>
					<div className='text-center md:text-left'>
						<p className='text-sm'>© 2026 Zor Pizza. Barcha huquqlar himoyalangan.</p>
					</div>
					<div className='flex items-center gap-6'>
						<a
							href='tel:+998901234567'
							className='flex items-center gap-2 text-gray-300 hover:text-white transition-colors'
						>
							<Phone className='w-4 h-4' />
							<span className='text-sm font-medium'>+998 90 123 45 67</span>
						</a>
					</div>
				</div>
			</div>
		</footer>
	)
}
