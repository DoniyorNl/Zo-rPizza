// frontend/components/home/HeroSection.tsx
// 🎨 HERO SECTION - Welcome message va featured content

'use client'

import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

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
	const [greeting, setGreeting] = useState('')
	const [mounted, setMounted] = useState(false)
	const shouldReduceMotion = useReducedMotion()

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setGreeting(getGreeting())
		setMounted(true)
	}, [])

	if (!mounted) {
		return null // Prevent hydration mismatch
	}

	// Simpler animations for mobile/reduced motion
	const animationVariants = shouldReduceMotion
		? {
				initial: { opacity: 1 },
				animate: { opacity: 1 },
		  }
		: {
				initial: { opacity: 0, y: 20 },
				animate: { opacity: 1, y: 0 },
		  }

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
					<motion.p
						initial={animationVariants.initial}
						animate={animationVariants.animate}
						transition={{ duration: shouldReduceMotion ? 0 : 0.5 }}
						className='text-orange-600 font-medium text-base md:text-lg mb-2'
					>
						{greeting}, pitsa sevuvchi! 👋
					</motion.p>

					{/* Main Message */}
					<motion.h1
						initial={animationVariants.initial}
						animate={animationVariants.animate}
						transition={{ duration: shouldReduceMotion ? 0 : 0.6, delay: shouldReduceMotion ? 0 : 0.1 }}
						className='text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-3 md:mb-4'
					>
						Pitsa ishtahasi ochganmi? 🍕
					</motion.h1>

					{/* Subtitle */}
					<motion.p
						initial={animationVariants.initial}
						animate={animationVariants.animate}
						transition={{ duration: shouldReduceMotion ? 0 : 0.6, delay: shouldReduceMotion ? 0 : 0.2 }}
						className='text-lg md:text-xl lg:text-2xl text-gray-600 mb-6 md:mb-8'
					>
						Eng mazali pitsalar, tez yetkazib berish va ajoyib aksiyalar!
					</motion.p>

					{/* CTA Buttons */}
					<motion.div
						initial={animationVariants.initial}
						animate={animationVariants.animate}
						transition={{ duration: shouldReduceMotion ? 0 : 0.6, delay: shouldReduceMotion ? 0 : 0.3 }}
						className='flex flex-col sm:flex-row gap-3 md:gap-4 justify-center'
					>
						<button
							onClick={() => {
								const element = document.getElementById('products-section')
								element?.scrollIntoView({ behavior: 'smooth' })
							}}
							className='px-6 md:px-8 py-3 md:py-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 active:scale-95 touch-manipulation'
							aria-label='Buyurtma berish'
						>
							Buyurtma berish
						</button>
						<button
							onClick={() => {
								const element = document.getElementById('deals-section')
								element?.scrollIntoView({ behavior: 'smooth' })
							}}
							className='px-6 md:px-8 py-3 md:py-4 bg-white hover:bg-gray-50 text-orange-600 font-semibold rounded-full border-2 border-orange-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 active:scale-95 touch-manipulation'
							aria-label="Aksiyalarni ko'rish"
						>
							Aksiyalar
						</button>
					</motion.div>

					{/* Quick Stats - Simplified for mobile */}
					<div className='mt-8 md:mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-center'>
						<motion.div
							initial={animationVariants.initial}
							animate={animationVariants.animate}
							transition={{ duration: shouldReduceMotion ? 0 : 0.5, delay: shouldReduceMotion ? 0 : 0.4 }}
						>
							<div className='text-2xl md:text-3xl font-bold text-orange-600' aria-label='1000 dan ortiq buyurtmalar'>1000+</div>
							<div className='text-xs md:text-sm text-gray-600 mt-1'>Buyurtmalar</div>
						</motion.div>
						<motion.div
							initial={animationVariants.initial}
							animate={animationVariants.animate}
							transition={{ duration: shouldReduceMotion ? 0 : 0.5, delay: shouldReduceMotion ? 0 : 0.5 }}
						>
							<div className='text-2xl md:text-3xl font-bold text-orange-600' aria-label='30 daqiqada yetkazish'>30 daq</div>
							<div className='text-xs md:text-sm text-gray-600 mt-1'>Yetkazish</div>
						</motion.div>
						<motion.div
							initial={animationVariants.initial}
							animate={animationVariants.animate}
							transition={{ duration: shouldReduceMotion ? 0 : 0.5, delay: shouldReduceMotion ? 0 : 0.6 }}
						>
							<div className='text-2xl md:text-3xl font-bold text-orange-600' aria-label='50 dan ortiq mahsulotlar'>50+</div>
							<div className='text-xs md:text-sm text-gray-600 mt-1'>Mahsulotlar</div>
						</motion.div>
						<motion.div
							initial={animationVariants.initial}
							animate={animationVariants.animate}
							transition={{ duration: shouldReduceMotion ? 0 : 0.5, delay: shouldReduceMotion ? 0 : 0.7 }}
						>
							<div className='text-2xl md:text-3xl font-bold text-orange-600' aria-label='4.9 yulduz reyting'>4.9⭐</div>
							<div className='text-xs md:text-sm text-gray-600 mt-1'>Reyting</div>
						</motion.div>
					</div>
				</div>
			</div>

		</section>
	)
}
