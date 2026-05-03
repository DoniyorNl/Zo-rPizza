// frontend/components/home/DealsSection.tsx
// 🎁 DEALS SECTION - Aksiya va kuponlar ko'rsatish

'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useDeals } from '@/hooks/useDeals'
import { Deal } from '@/types/deal.types'
import { Calendar, Percent, Tag } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'

/**
 * Format date to readable string
 */
function formatDate(date: string | Date): string {
	const d = new Date(date)
	return d.toLocaleDateString('uz-UZ', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	})
}

/**
 * Get days remaining
 */
function getDaysRemaining(endDate: string | Date): number {
	const end = new Date(endDate)
	const now = new Date()
	const diff = end.getTime() - now.getTime()
	return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

/**
 * Deal Card Component
 */
function DealCard({ deal }: { deal: Deal }) {
	const router = useRouter()
	const daysRemaining = deal.endsAt ? getDaysRemaining(deal.endsAt) : null
	const isExpiringSoon = daysRemaining !== null && daysRemaining <= 3 && daysRemaining >= 0

	const getDiscountText = () => {
		if (deal.discountType === 'PERCENT') return `${deal.discountValue}% chegirma`
		if (deal.discountType === 'FIXED') return `${deal.discountValue.toLocaleString()} so'm chegirma`
		return 'Maxsus taklif'
	}

	return (
		<Card className='group cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden bg-gradient-to-br from-white to-orange-50 border-2 border-orange-100'>
			<div className='relative'>
				{/* Image */}
				{deal.imageUrl && (
					<div className='relative h-48 overflow-hidden bg-gradient-to-br from-orange-400 to-orange-600'>
						<Image
							src={deal.imageUrl}
							alt={deal.title}
							fill
							className='object-cover group-hover:scale-110 transition-transform duration-500'
							sizes='(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'
						/>
						<div className='absolute inset-0 bg-gradient-to-t from-black/40 to-transparent'></div>
					</div>
				)}

				{/* Discount Badge */}
				<div className='absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-full font-bold text-lg shadow-xl transform rotate-[-5deg] group-hover:rotate-0 transition-transform'>
					{deal.discountType === 'PERCENT' && (
						<span className='flex items-center gap-1'>
							<Percent className='w-5 h-5' />
							{deal.discountValue}%
						</span>
					)}
					{deal.discountType === 'FIXED' && (
						<span className='flex items-center gap-1'>
							<Tag className='w-5 h-5' />
							-{(deal.discountValue / 1000).toFixed(0)}k
						</span>
					)}
				</div>

				{/* Expiring Soon Badge */}
				{isExpiringSoon && (
					<Badge className='absolute top-4 right-4 bg-yellow-500 text-black animate-pulse'>
						⚡ {daysRemaining} kun qoldi!
					</Badge>
				)}
			</div>

			{/* Content */}
			<div className='p-6'>
				<h3 className='font-bold text-xl text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors'>
					{deal.title}
				</h3>

				<p className='text-orange-600 font-semibold text-lg mb-3'>
					{getDiscountText()}
				</p>

				{deal.description && (
					<p className='text-gray-600 text-sm mb-4 line-clamp-2'>
						{deal.description}
					</p>
				)}

				{/* Date Range */}
				{(deal.startsAt || deal.endsAt) && (
					<div className='flex items-center gap-2 text-sm text-gray-500 mb-4'>
						<Calendar className='w-4 h-4' />
						<span>
							{deal.startsAt && formatDate(deal.startsAt)}
							{deal.startsAt && deal.endsAt && ' - '}
							{deal.endsAt && formatDate(deal.endsAt)}
						</span>
					</div>
				)}

				<Button
					onClick={() => router.push('#products-section')}
					className='w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-lg group-hover:shadow-xl transition-all'
				>
					Foydalanish
				</Button>
			</div>
		</Card>
	)
}

/**
 * DealsSection Component
 * 
 * Displays all active deals in a horizontal scroll or grid
 * Features:
 * - Auto-refresh
 * - Expiring soon badges
 * - Responsive layout
 * - Beautiful animations
 */
export function DealsSection() {
	// useMemo to prevent recreating options object
	const dealOptions = useMemo(() => ({
		isActive: true,
		availableNow: true,
		hasStock: true,
		sortBy: 'priority' as const,
	}), [])

	const { deals, loading, error } = useDeals(dealOptions)

	if (loading) {
		return (
			<section id='deals-section' className='py-12 bg-white'>
				<div className='container mx-auto px-4'>
					<h2 className='text-3xl font-bold text-center mb-8'>🎁 Aksiyalar</h2>
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
						{[1, 2, 3].map(i => (
							<Card key={i} className='h-96 animate-pulse bg-gray-100'></Card>
						))}
					</div>
				</div>
			</section>
		)
	}

	if (error) {
		return (
			<section id='deals-section' className='py-12 bg-white'>
				<div className='container mx-auto px-4 text-center'>
					<p className='text-red-600'>{error}</p>
				</div>
			</section>
		)
	}

	if (deals.length === 0) {
		return null // Don't show section if no deals
	}

	return (
		<section id='deals-section' className='py-12 bg-gradient-to-b from-white to-orange-50'>
			<div className='container mx-auto px-4'>
				{/* Section Header */}
				<div className='text-center mb-10'>
					<Badge className='mb-4 bg-orange-100 text-orange-700 px-4 py-2 text-sm'>
						🎁 Maxsus Takliflar
					</Badge>
					<h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-3'>
						Chegirma va Aksiyalar
					</h2>
					<p className='text-gray-600 max-w-2xl mx-auto'>
						Eng yaxshi takliflardan foydalaning va sevimli pitsalaringizni tejamkor
						narxda buyurtma qiling!
					</p>
				</div>

				{/* Deals Grid */}
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
					{deals.slice(0, 6).map(deal => (
						<DealCard key={deal.id} deal={deal} />
					))}
				</div>

				{/* View All Button */}
				{deals.length > 6 && (
					<div className='text-center mt-8'>
						<Button
							variant='outline'
							size='lg'
							className='border-orange-600 text-orange-600 hover:bg-orange-50'
						>
							Barcha aksiyalarni ko&apos;rish ({deals.length})
						</Button>
					</div>
				)}
			</div>
		</section>
	)
}
