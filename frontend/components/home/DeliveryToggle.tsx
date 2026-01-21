// frontend/components/home/DeliveryToggle.tsx
// 🚚 DELIVERY/PICKUP TOGGLE - Method selector

'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Clock, MapPin, Store, Truck } from 'lucide-react'
import { useState } from 'react'

/**
 * Delivery method type
 */
type DeliveryMethod = 'delivery' | 'pickup'

/**
 * DeliveryToggle Component
 * 
 * Toggle between delivery and pickup
 * Features:
 * - Delivery/Pickup selector
 * - Location input
 * - Estimated time
 * - Store selector
 */
export function DeliveryToggle() {
	const [method, setMethod] = useState<DeliveryMethod>('delivery')
	const [location, setLocation] = useState('')
	const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)

	/**
	 * Get estimated delivery time
	 */
	const getEstimatedTime = () => {
		return method === 'delivery' ? '30-40 daqiqa' : '15-20 daqiqa'
	}

	/**
	 * Get minimum order amount
	 */
	const getMinOrder = () => {
		return method === 'delivery' ? '50,000 so\'m' : 'Minimal chegara yo\'q'
	}

	return (
		<div className='sticky top-0 z-50 bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg'>
			<div className='container mx-auto px-4 py-4'>
				<div className='flex flex-col md:flex-row items-center justify-between gap-4'>
					{/* Left: Method Toggle */}
					<div className='flex items-center gap-4'>
						{/* Toggle Buttons */}
						<div className='flex bg-white/20 rounded-full p-1'>
							<button
								onClick={() => setMethod('delivery')}
								className={cn(
									'flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all',
									method === 'delivery'
										? 'bg-white text-orange-600 shadow-md'
										: 'text-white hover:bg-white/10'
								)}
							>
								<Truck className='w-4 h-4' />
								<span className='hidden sm:inline'>Yetkazib berish</span>
								<span className='sm:hidden'>Yetkazish</span>
							</button>

							<button
								onClick={() => setMethod('pickup')}
								className={cn(
									'flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all',
									method === 'pickup'
										? 'bg-white text-orange-600 shadow-md'
										: 'text-white hover:bg-white/10'
								)}
							>
								<Store className='w-4 h-4' />
								<span className='hidden sm:inline'>Olib ketish</span>
								<span className='sm:hidden'>Olib ket</span>
							</button>
						</div>

						{/* Method Info */}
						<div className='hidden lg:flex items-center gap-4 text-sm'>
							<div className='flex items-center gap-1'>
								<Clock className='w-4 h-4' />
								<span>{getEstimatedTime()}</span>
							</div>
							<div className='flex items-center gap-1'>
								<Badge variant='secondary' className='bg-white/20 border-0'>
									Min: {getMinOrder()}
								</Badge>
							</div>
						</div>
					</div>

					{/* Right: Location/Store Selector */}
					<div className='w-full md:w-auto'>
						{method === 'delivery' ? (
							<Button
								onClick={() => setIsLocationModalOpen(true)}
								variant='secondary'
								className='w-full md:w-auto bg-white/20 hover:bg-white/30 text-white border-white/30'
							>
								<MapPin className='w-4 h-4 mr-2' />
								{location || 'Manzilni tanlang'}
							</Button>
						) : (
							<Button
								onClick={() => setIsLocationModalOpen(true)}
								variant='secondary'
								className='w-full md:w-auto bg-white/20 hover:bg-white/30 text-white border-white/30'
							>
								<Store className='w-4 h-4 mr-2' />
								Do'konni tanlang
							</Button>
						)}
					</div>
				</div>

				{/* Mobile: Additional Info */}
				<div className='lg:hidden flex items-center justify-center gap-4 mt-3 text-sm'>
					<div className='flex items-center gap-1'>
						<Clock className='w-4 h-4' />
						<span>{getEstimatedTime()}</span>
					</div>
					<span className='text-white/50'>•</span>
					<div>Min: {getMinOrder()}</div>
				</div>
			</div>

			{/* Location Modal (Placeholder) */}
			{isLocationModalOpen && (
				<div className='fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4'>
					<div className='bg-white rounded-lg p-6 max-w-md w-full'>
						<h3 className='text-xl font-bold text-gray-900 mb-4'>
							{method === 'delivery' ? 'Manzilni kiriting' : 'Do\'konni tanlang'}
						</h3>

						<input
							type='text'
							placeholder={
								method === 'delivery'
									? 'Ko\'cha, uy raqami...'
									: 'Do\'kon nomini tanlang...'
							}
							className='w-full px-4 py-3 border rounded-lg mb-4 text-gray-900'
							value={location}
							onChange={e => setLocation(e.target.value)}
						/>

						<div className='flex gap-3'>
							<Button
								onClick={() => setIsLocationModalOpen(false)}
								variant='outline'
								className='flex-1 text-gray-700 border-gray-300 hover:bg-gray-100'
							>
								Bekor qilish
							</Button>
							<Button
								onClick={() => setIsLocationModalOpen(false)}
								className='flex-1 bg-orange-600 hover:bg-orange-700'
							>
								Tasdiqlash
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
