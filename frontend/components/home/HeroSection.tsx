// frontend/components/home/HeroSection.tsx
// 🎨 HERO SECTION - Welcome message va featured content

'use client'

/**
 * Get greeting based on time of day
 */
function getGreeting(): string {
	const hour = new Date().getHours()

	if (hour >= 5 && hour < 12) {
		return 'Xayrli tong'
	} else if (hour >= 12 && hour < 18) {
		return 'Xayrli kun'
	} else {
		return 'Xayrli kech'
	}
}

/**
 * HeroSection Component
 *
 * Main hero section with:
 * - Time-based greeting
 * - Welcome message
 * - Call to action
 *
 * Inspired by New York Pizza style - minimal and friendly
 * Optimized for mobile performance with reduced motion support
 */
export function HeroSection() {
	const greeting = getGreeting()

	return (
		<section
			className='relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-orange-50 py-8 md:py-12'
			aria-label='Hero section'
		>
			{/* Background Pattern (Optional) - Hidden on mobile for performance */}
			<div className='absolute inset-0 opacity-5 hidden md:block' aria-hidden='true'>
				<div className='absolute top-10 left-10 w-64 h-64 bg-orange-400 rounded-full blur-3xl'></div>
				<div className='absolute bottom-10 right-10 w-96 h-96 bg-orange-300 rounded-full blur-3xl'></div>
			</div>

			{/* Content */}
			<div className='container mx-auto px-4 relative z-10'>
				<div className='max-w-4xl mx-auto text-center'>
					{/* Greeting */}
					<p className='text-orange-700 font-medium text-base md:text-lg mb-2' suppressHydrationWarning>
						{greeting}, pitsa sevuvchi! 👋
					</p>

					{/* Main Message */}
					<h1 className='text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-3 md:mb-4'>
						Pitsa ishtahasi ochganmi? 🍕
					</h1>

					{/* Subtitle */}
					<p className='text-lg md:text-xl lg:text-2xl text-gray-600 mb-6 md:mb-8'>
						Eng mazali pitsalar, tez yetkazib berish va ajoyib aksiyalar!
					</p>

					{/* CTA Buttons */}
					<div className='flex flex-col sm:flex-row gap-3 md:gap-4 justify-center'>
						<a
							href='#products-section'
							className='px-6 md:px-8 py-3 md:py-4 bg-orange-700 hover:bg-orange-800 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 active:scale-95 touch-manipulation'
							aria-label='Buyurtma berish'
						>
							Buyurtma berish
						</a>
						<a
							href='#deals-section'
							className='px-6 md:px-8 py-3 md:py-4 bg-white hover:bg-gray-50 text-orange-800 font-semibold rounded-full border-2 border-orange-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 active:scale-95 touch-manipulation'
							aria-label="Aksiyalarni ko'rish"
						>
							Aksiyalar
						</a>
					</div>

					{/* Quick Stats - Simplified for mobile */}
					<div className='mt-8 md:mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-center'>
						<div>
							<div className='text-2xl md:text-3xl font-bold text-orange-700' aria-label='1000 dan ortiq buyurtmalar'>
								1000+
							</div>
							<div className='text-xs md:text-sm text-gray-600 mt-1'>Buyurtmalar</div>
						</div>
						<div>
							<div className='text-2xl md:text-3xl font-bold text-orange-700' aria-label='30 daqiqada yetkazish'>
								30 daq
							</div>
							<div className='text-xs md:text-sm text-gray-600 mt-1'>Yetkazish</div>
						</div>
						<div>
							<div className='text-2xl md:text-3xl font-bold text-orange-700' aria-label='50 dan ortiq mahsulotlar'>
								50+
							</div>
							<div className='text-xs md:text-sm text-gray-600 mt-1'>Mahsulotlar</div>
						</div>
						<div>
							<div className='text-2xl md:text-3xl font-bold text-orange-700' aria-label='4.9 yulduz reyting'>
								4.9⭐
							</div>
							<div className='text-xs md:text-sm text-gray-600 mt-1'>Reyting</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
