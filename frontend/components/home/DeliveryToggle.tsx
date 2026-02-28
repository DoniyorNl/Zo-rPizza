// frontend/components/home/DeliveryToggle.tsx
// 🚚 DELIVERY/PICKUP TOGGLE - Method selector

'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { buildApiUrl } from '@/lib/apiBaseUrl'
import { useDeliveryStore, type Branch } from '@/store/deliveryStore'
import { Clock, MapPin, Phone, Store, Truck } from 'lucide-react'
import { useEffect, useState } from 'react'

export function DeliveryToggle() {
	const { method, setMethod, selectedBranch, setSelectedBranch } = useDeliveryStore()
	const [location, setLocation] = useState('')
	const [branches, setBranches] = useState<Branch[]>([])
	const [branchesLoading, setBranchesLoading] = useState(false)
	const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)

	// Do'konlar ro'yxati – modal ochilganda (pickup) yoki doim bir marta
	useEffect(() => {
		if (!isLocationModalOpen || method !== 'pickup') return
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setBranchesLoading(true)
		fetch(buildApiUrl('/api/branches'))
			.then((res) => res.json())
			.then((data) => {
				if (data?.success && Array.isArray(data.data)) setBranches(data.data)
				else setBranches([])
			})
			.catch(() => setBranches([]))
			.finally(() => setBranchesLoading(false))
	}, [isLocationModalOpen, method])

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
								type='button'
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
								type='button'
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
								{selectedBranch ? selectedBranch.name : "Do'konni tanlang"}
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

			{/* Modal: Yetkazib berish = manzil, Olib ketish = filiallar ro'yxati */}
			{isLocationModalOpen && (
				<div
					className='fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4'
					onClick={() => setIsLocationModalOpen(false)}
				>
					<div
						className='bg-white rounded-xl shadow-xl max-w-md w-full max-h-[85vh] flex flex-col'
						onClick={e => e.stopPropagation()}
					>
						<div className='p-4 border-b'>
							<h3 className='text-xl font-bold text-gray-900'>
								{method === 'delivery' ? 'Manzilni kiriting' : "Do'konni tanlang"}
							</h3>
						</div>

						{method === 'delivery' ? (
							<div className='p-4 space-y-4'>
								<input
									type='text'
									placeholder="Ko'cha, uy raqami..."
									className='w-full px-4 py-3 border rounded-lg text-gray-900'
									value={location}
									onChange={e => setLocation(e.target.value)}
								/>
								<div className='flex gap-3'>
									<Button
										onClick={() => setIsLocationModalOpen(false)}
										variant='outline'
										className='flex-1 border-gray-300 text-gray-800 hover:bg-gray-100 hover:text-gray-900'
									>
										Bekor qilish
									</Button>
									<Button
										onClick={() => setIsLocationModalOpen(false)}
										className='flex-1 bg-orange-600 hover:bg-orange-700 text-white'
									>
										Tasdiqlash
									</Button>
								</div>
							</div>
						) : (
							<>
								<div className='overflow-y-auto p-4 flex-1'>
									{branchesLoading ? (
										<div className='text-center py-8 text-gray-500'>
											<div className='animate-spin rounded-full h-10 w-10 border-2 border-orange-500 border-t-transparent mx-auto mb-2' />
											<p>Filiallar yuklanmoqda...</p>
										</div>
									) : branches.length === 0 ? (
										<p className='text-gray-500 text-center py-6'>
											Hozircha filiallar ro&apos;yxati mavjud emas.
										</p>
									) : (
										<ul className='space-y-3'>
											{branches.map(branch => (
												<li key={branch.id}>
													<button
														type='button'
														onClick={() => {
															setSelectedBranch(branch)
															setIsLocationModalOpen(false)
														}}
														className='w-full text-left p-4 rounded-lg border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50/50 transition-colors'
													>
														<div className='font-semibold text-gray-900 flex items-center gap-2'>
															<Store className='w-4 h-4 text-orange-600' />
															{branch.name}
														</div>
														<div className='flex items-start gap-2 mt-1 text-sm text-gray-600'>
															<MapPin className='w-4 h-4 shrink-0 mt-0.5' />
															<span>{branch.address}</span>
														</div>
														{branch.phone && (
															<div className='flex items-center gap-2 mt-1 text-sm text-gray-600'>
																<Phone className='w-4 h-4 shrink-0' />
																{branch.phone}
															</div>
														)}
														<a
															href={`https://www.google.com/maps?q=${branch.lat},${branch.lng}`}
															target='_blank'
															rel='noopener noreferrer'
															onClick={e => e.stopPropagation()}
															className='inline-flex items-center gap-1 mt-2 text-sm text-orange-600 hover:underline'
														>
															<MapPin className='w-3 h-3' />
															Xaritada ko&apos;rish
														</a>
													</button>
												</li>
											))}
										</ul>
									)}
								</div>
								<div className='p-4 border-t bg-gray-50/50'>
									<Button
										onClick={() => setIsLocationModalOpen(false)}
										variant='outline'
										className='w-full border-gray-300 text-gray-800 hover:bg-gray-100 hover:text-gray-900'
									>
										Yopish
									</Button>
								</div>
							</>
						)}
					</div>
				</div>
			)}
		</div>
	)
}
