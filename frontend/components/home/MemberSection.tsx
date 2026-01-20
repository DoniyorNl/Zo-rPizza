// frontend/components/home/MemberSection.tsx
// 💎 MEMBER SECTION - Loyalty program preview

'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Gift, Star, Trophy, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'

/**
 * Member benefits
 */
const MEMBER_BENEFITS = [
	{
		icon: Star,
		title: 'Har safar ballar',
		description: '1000 so\'m = 1 ball',
	},
	{
		icon: Gift,
		title: 'Maxsus takliflar',
		description: 'Faqat a\'zolar uchun',
	},
	{
		icon: Zap,
		title: 'Tezkor yetkazish',
		description: 'Ustunlik yetkazishda',
	},
	{
		icon: Trophy,
		title: 'Tug\'ilgan kun sovg\'asi',
		description: 'Bepul pitsa!',
	},
]

/**
 * Exclusive member deals (example)
 */
const EXCLUSIVE_DEALS = [
	{
		id: '1',
		title: 'Maxsus Margherita Pizza',
		points: 50,
		discount: '20% chegirma',
		imageUrl: '/images/pizza-margherita.jpg',
	},
	{
		id: '2',
		title: 'Bepul Shirinlik',
		points: 25,
		discount: '100% bepul',
		imageUrl: '/images/dessert.jpg',
	},
	{
		id: '3',
		title: 'Katta Pizza Chegirma',
		points: 75,
		discount: '30% chegirma',
		imageUrl: '/images/large-pizza.jpg',
	},
]

/**
 * MemberSection Component
 * 
 * Displays member/loyalty program information
 * Features:
 * - Benefits showcase
 * - Exclusive deals preview
 * - Sign up CTA
 * - Points explanation
 */
export function MemberSection() {
	const router = useRouter()

	return (
		<section className='py-16 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50'>
			<div className='container mx-auto px-4'>
				{/* Section Header */}
				<div className='text-center mb-12'>
					<Badge className='mb-4 bg-purple-100 text-purple-700 px-4 py-2 text-sm'>
						💎 VIP A'zolik
					</Badge>
					<h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-3'>
						A'zo Bo'ling va Bonuslardan Foydalaning!
					</h2>
					<p className='text-gray-600 max-w-2xl mx-auto'>
						Har safar buyurtma qiling va ballar to'plang. Ballaringizni maxsus
						takliflarga almashtiring!
					</p>
				</div>

				{/* Benefits Grid */}
				<div className='grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12'>
					{MEMBER_BENEFITS.map((benefit, index) => {
						const Icon = benefit.icon
						return (
							<Card
								key={index}
								className='p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white/80 backdrop-blur'
							>
								<div className='inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4'>
									<Icon className='w-6 h-6 text-white' />
								</div>
								<h3 className='font-bold text-gray-900 mb-2'>{benefit.title}</h3>
								<p className='text-sm text-gray-600'>{benefit.description}</p>
							</Card>
						)
					})}
				</div>

				{/* Exclusive Deals */}
				<div className='mb-12'>
					<h3 className='text-2xl font-bold text-center mb-6'>
						Maxsus A'zolar Takliflari
					</h3>
					<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
						{EXCLUSIVE_DEALS.map(deal => (
							<Card
								key={deal.id}
								className='group overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-white to-purple-50'
							>
								{/* Placeholder Image */}
								<div className='h-40 bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center'>
									<span className='text-6xl'>🍕</span>
								</div>

								<div className='p-6'>
									<h4 className='font-bold text-lg mb-2'>{deal.title}</h4>
									<div className='flex items-center justify-between mb-4'>
										<Badge className='bg-purple-600'>{deal.discount}</Badge>
										<span className='text-sm text-gray-600'>
											{deal.points} ball
										</span>
									</div>
									<Button
										onClick={() => router.push('/register')}
										className='w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
									>
										A'zo Bo'lish
									</Button>
								</div>
							</Card>
						))}
					</div>
				</div>

				{/* CTA Section */}
				<Card className='p-8 md:p-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center'>
					<h3 className='text-3xl font-bold mb-4'>
						Hoziroq A'zo Bo'ling va Bonuslar Oling!
					</h3>
					<p className='text-lg mb-6 opacity-90'>
						Ro'yxatdan o'ting va birinchi buyurtmangizda 100 bonus ball oling! 🎁
					</p>
					<div className='flex flex-col sm:flex-row gap-4 justify-center'>
						<Button
							onClick={() => router.push('/register')}
							size='lg'
							className='bg-white text-purple-600 hover:bg-gray-100 font-bold shadow-xl'
						>
							Bepul Ro'yxatdan O'tish
						</Button>
						<Button
							onClick={() => router.push('/login')}
							size='lg'
							variant='outline'
							className='border-2 border-white text-white hover:bg-white/10'
						>
							Kirish
						</Button>
					</div>

					{/* Small Print */}
					<p className='text-sm mt-6 opacity-75'>
						A'zolik bepul va doimiy. Shartlar va qoidalar amal qiladi.
					</p>
				</Card>

				{/* How it Works */}
				<div className='mt-12 max-w-3xl mx-auto'>
					<h3 className='text-2xl font-bold text-center mb-6'>
						Qanday Ishlaydi?
					</h3>
					<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
						<div className='text-center'>
							<div className='w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold'>
								1
							</div>
							<h4 className='font-semibold mb-2'>Ro'yxatdan O'ting</h4>
							<p className='text-sm text-gray-600'>
								Email yoki telefon raqam bilan
							</p>
						</div>
						<div className='text-center'>
							<div className='w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold'>
								2
							</div>
							<h4 className='font-semibold mb-2'>Buyurtma Qiling</h4>
							<p className='text-sm text-gray-600'>
								Har 1000 so'mdan 1 ball oling
							</p>
						</div>
						<div className='text-center'>
							<div className='w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold'>
								3
							</div>
							<h4 className='font-semibold mb-2'>Bonuslardan Foydalaning</h4>
							<p className='text-sm text-gray-600'>
								Ballarni chegirmalarga almashtiring
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
