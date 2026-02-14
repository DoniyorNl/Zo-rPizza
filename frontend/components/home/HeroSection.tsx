// frontend/components/home/HeroSection.tsx
// 🎨 HERO SECTION - Welcome message va featured content

'use client'

import { useEffect, useState } from 'react'

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
 */
export function HeroSection() {
	const [greeting, setGreeting] = useState('')
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setGreeting(getGreeting())
		setMounted(true)
	}, [])

	if (!mounted) {
		return null // Prevent hydration mismatch
	}

	return (
		<section className='relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-orange-50 py-12'>
			{/* Background Pattern (Optional) */}
			<div className='absolute inset-0 opacity-5'>
				<div className='absolute top-10 left-10 w-64 h-64 bg-orange-400 rounded-full blur-3xl'></div>
				<div className='absolute bottom-10 right-10 w-96 h-96 bg-orange-300 rounded-full blur-3xl'></div>
			</div>

			{/* Content */}
			<div className='container mx-auto px-4 relative z-10'>
				<div className='max-w-4xl mx-auto text-center'>
					{/* Greeting */}
					<p className='text-orange-600 font-medium text-lg mb-2 animate-fade-in'>
						{greeting}, pitsa sevuvchi! 👋
					</p>

					{/* Main Message */}
					<h1 className='text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 animate-slide-up'>
						Pitsa ishtahasi ochganmi? 🍕
					</h1>

					{/* Subtitle */}
					<p className='text-xl md:text-2xl text-gray-600 mb-8 animate-slide-up animation-delay-100'>
						Eng mazali pitsalar, tez yetkazib berish va ajoyib aksiyalar!
					</p>

					{/* CTA Buttons (Optional) */}
					<div className='flex flex-col sm:flex-row gap-4 justify-center animate-slide-up animation-delay-200'>
						<button
							onClick={() => {
								const element = document.getElementById('products-section')
								element?.scrollIntoView({ behavior: 'smooth' })
							}}
							className='px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1'
						>
							Buyurtma berish
						</button>
						<button
							onClick={() => {
								const element = document.getElementById('deals-section')
								element?.scrollIntoView({ behavior: 'smooth' })
							}}
							className='px-8 py-4 bg-white hover:bg-gray-50 text-orange-600 font-semibold rounded-full border-2 border-orange-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1'
						>
							Aksiyalar
						</button>
					</div>

					{/* Quick Stats (Optional) */}
					<div className='mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center'>
						<div className='animate-fade-in animation-delay-300'>
							<div className='text-3xl font-bold text-orange-600'>1000+</div>
							<div className='text-sm text-gray-600 mt-1'>Buyurtmalar</div>
						</div>
						<div className='animate-fade-in animation-delay-400'>
							<div className='text-3xl font-bold text-orange-600'>30 daq</div>
							<div className='text-sm text-gray-600 mt-1'>Yetkazish</div>
						</div>
						<div className='animate-fade-in animation-delay-500'>
							<div className='text-3xl font-bold text-orange-600'>50+</div>
							<div className='text-sm text-gray-600 mt-1'>Mahsulotlar</div>
						</div>
						<div className='animate-fade-in animation-delay-600'>
							<div className='text-3xl font-bold text-orange-600'>4.9⭐</div>
							<div className='text-sm text-gray-600 mt-1'>Reyting</div>
						</div>
					</div>
				</div>
			</div>

			{/* Custom Animations (Add to globals.css) */}
			<style>{`
				@keyframes fade-in {
					from {
						opacity: 0;
					}
					to {
						opacity: 1;
					}
				}

				@keyframes slide-up {
					from {
						opacity: 0;
						transform: translateY(20px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}

				.animate-fade-in {
					animation: fade-in 0.8s ease-out forwards;
				}

				.animate-slide-up {
					animation: slide-up 0.8s ease-out forwards;
				}

				.animation-delay-100 {
					animation-delay: 0.1s;
					opacity: 0;
				}

				.animation-delay-200 {
					animation-delay: 0.2s;
					opacity: 0;
				}

				.animation-delay-300 {
					animation-delay: 0.3s;
					opacity: 0;
				}

				.animation-delay-400 {
					animation-delay: 0.4s;
					opacity: 0;
				}

				.animation-delay-500 {
					animation-delay: 0.5s;
					opacity: 0;
				}

				.animation-delay-600 {
					animation-delay: 0.6s;
					opacity: 0;
				}
			`}</style>
		</section>
	)
}
