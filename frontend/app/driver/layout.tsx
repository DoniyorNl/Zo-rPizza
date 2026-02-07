/**
 * 🚗 DRIVER LAYOUT
 * Driver sahifalar uchun umumiy layout
 * - Faqat DRIVER role kirishi mumkin
 * - Navigation: Dashboard, Profile
 * - Real-time notifications
 */

'use client'

import { useAuth } from '@/lib/AuthContext'
import { LayoutDashboard, LogOut, MapPin, Truck, User } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DriverLayout({ children }: { children: React.ReactNode }) {
	const { user, backendUser, logout, loading } = useAuth()
	const router = useRouter()

	// Auth Guard: faqat DELIVERY role kirishi mumkin
	useEffect(() => {
		if (!loading && (!user || !backendUser || backendUser.role !== 'DELIVERY')) {
			router.push('/login')
		}
	}, [user, backendUser, loading, router])

	// Loading state
	if (loading) {
		return (
			<div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto'></div>
					<p className='mt-4 text-gray-600 font-medium'>Yuklanmoqda...</p>
				</div>
			</div>
		)
	}

	// User yo'q yoki DELIVERY emas
	if (!user || !backendUser || backendUser.role !== 'DELIVERY') {
		return null // redirect boshlanmoqda
	}

	const handleLogout = async () => {
		try {
			await logout()
			router.push('/login')
		} catch (error) {
			console.error('Logout error:', error)
		}
	}

	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50'>
			{/* Header */}
			<header className='bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='flex items-center justify-between h-16'>
						{/* Logo */}
						<Link href='/driver/dashboard' className='flex items-center space-x-3 group'>
							<div className='relative'>
								<Truck className='w-8 h-8 text-blue-600 group-hover:text-blue-700 transition-colors' />
								<div className='absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse' />
							</div>
							<div>
								<h1 className='text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors'>
									Driver Panel
								</h1>
								<p className='text-xs text-gray-500'>Zo&apos;r Pizza</p>
							</div>
						</Link>

						{/* User Info & Actions */}
						<div className='flex items-center space-x-6'>
							{/* User Profile */}
							<div className='flex items-center space-x-3 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100'>
								<div className='w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md'>
									<User className='w-6 h-6 text-white' />
								</div>
								<div className='hidden sm:block'>
									<p className='text-sm font-semibold text-gray-900'>
										{backendUser?.name || 'Driver'}
									</p>
									<p className='text-xs text-gray-600 flex items-center'>
										<MapPin className='w-3 h-3 mr-1' />
										{backendUser?.vehicleType || 'Mototsikl'}
									</p>
								</div>
							</div>

							{/* Logout Button */}
							<button
								onClick={handleLogout}
								className='flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200 border border-transparent hover:border-red-200'
							>
								<LogOut className='w-5 h-5' />
								<span className='hidden sm:inline text-sm font-medium'>Chiqish</span>
							</button>
						</div>
					</div>
				</div>
			</header>

			{/* Navigation Tabs */}
			<nav className='bg-white border-b border-gray-200 shadow-sm'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='flex space-x-8'>
						<NavLink href='/driver/dashboard' icon={LayoutDashboard}>
							Dashboard
						</NavLink>
						<NavLink href='/driver/orders' icon={Truck}>
							Buyurtmalar
						</NavLink>
						<NavLink href='/driver/history' icon={User}>
							Tarix
						</NavLink>
					</div>
				</div>
			</nav>

			{/* Main Content */}
			<main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>{children}</main>

			{/* Footer */}
			<footer className='mt-auto py-6 border-t border-gray-200 bg-white'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
					<p className='text-center text-sm text-gray-500'>
						© 2026 Zo&apos;r Pizza. GPS Tracking System v2.0
					</p>
				</div>
			</footer>
		</div>
	)
}

/**
 * Navigation Link Component
 */
interface NavLinkProps {
	href: string
	icon: React.ElementType
	children: React.ReactNode
}

function NavLink({ href, icon: Icon, children }: NavLinkProps) {
	return (
		<Link
			href={href}
			className='flex items-center space-x-2 py-4 border-b-2 border-transparent hover:border-blue-600 text-gray-600 hover:text-blue-600 transition-all duration-200 font-medium text-sm group'
		>
			<Icon className='w-5 h-5 group-hover:scale-110 transition-transform' />
			<span>{children}</span>
		</Link>
	)
}
