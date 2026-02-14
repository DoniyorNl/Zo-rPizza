/**
 * 🚗 DRIVER LAYOUT - IMPROVED
 * Driver sahifalar uchun umumiy layout
 * - Faqat DELIVERY role kirishi mumkin
 * - Navigation: Dashboard, Orders, History, Settings
 * - User dropdown menu
 */

'use client'

import { useAuth } from '@/lib/AuthContext'
import {
	ChevronDown,
	History,
	LayoutDashboard,
	LogOut,
	MapPin,
	Package,
	Settings,
	Truck,
	User,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export default function DriverLayout({ children }: { children: React.ReactNode }) {
	const { user, backendUser, logout, loading } = useAuth()
	const router = useRouter()
	const [showUserMenu, setShowUserMenu] = useState(false)
	const dropdownRef = useRef<HTMLDivElement>(null)
	const shouldBypassAuth =
		typeof window !== 'undefined' &&
		process.env.NEXT_PUBLIC_E2E_BYPASS_AUTH === 'true' &&
		process.env.NODE_ENV !== 'production'
	const isAuthorized = backendUser?.role === 'DELIVERY' && (user || shouldBypassAuth)

	// Auth Guard: faqat DELIVERY role kirishi mumkin
	useEffect(() => {
		if (!loading && !isAuthorized) {
			router.push('/login')
		}
	}, [loading, isAuthorized, router])

	// Close dropdown when clicking outside
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setShowUserMenu(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

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
	if (!isAuthorized) {
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

						{/* User Dropdown */}
						<div className='relative' ref={dropdownRef}>
							<button
								onClick={() => setShowUserMenu(!showUserMenu)}
								className='flex items-center space-x-3 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all'
							>
								<div className='w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md'>
									<User className='w-6 h-6 text-white' />
								</div>
								<div className='hidden sm:block text-left'>
									<p className='text-sm font-semibold text-gray-900'>
										{backendUser?.name || 'Driver'}
									</p>
									<p className='text-xs text-gray-600 flex items-center'>
										<MapPin className='w-3 h-3 mr-1' />
										{backendUser?.vehicleType || 'Mototsikl'}
									</p>
								</div>
								<ChevronDown
									className={`w-4 h-4 text-gray-600 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
								/>
							</button>

							{/* Dropdown Menu */}
							{showUserMenu && (
								<div className='absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50'>
									{/* User Info */}
									<div className='px-4 py-3 border-b border-gray-100'>
										<p className='text-sm font-semibold text-gray-900'>
											{backendUser?.name || 'Driver'}
										</p>
										<p className='text-xs text-gray-500'>{backendUser?.email}</p>
										<p className='text-xs text-gray-500 mt-1 flex items-center'>
											<MapPin className='w-3 h-3 mr-1' />
											Vehicle: {backendUser?.vehicleType || 'Mototsikl'}
										</p>
									</div>

									{/* Menu Items */}
									<div className='py-1'>
										<Link
											href='/driver/dashboard'
											className='flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors'
											onClick={() => setShowUserMenu(false)}
										>
											<LayoutDashboard className='w-4 h-4' />
											<span>Dashboard</span>
										</Link>

										<Link
											href='/driver/orders'
											className='flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors'
											onClick={() => setShowUserMenu(false)}
										>
											<Package className='w-4 h-4' />
											<span>Buyurtmalar</span>
										</Link>

										<Link
											href='/driver/history'
											className='flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors'
											onClick={() => setShowUserMenu(false)}
										>
											<History className='w-4 h-4' />
											<span>Tarix</span>
										</Link>

										<Link
											href='/driver/settings'
											className='flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors'
											onClick={() => setShowUserMenu(false)}
										>
											<Settings className='w-4 h-4' />
											<span>Sozlamalar</span>
										</Link>
									</div>

									{/* Logout */}
									<div className='border-t border-gray-100 pt-1'>
										<button
											onClick={() => {
												setShowUserMenu(false)
												handleLogout()
											}}
											className='flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left'
										>
											<LogOut className='w-4 h-4' />
											<span>Chiqish</span>
										</button>
									</div>
								</div>
							)}
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
						<NavLink href='/driver/orders' icon={Package}>
							Buyurtmalar
						</NavLink>
						<NavLink href='/driver/history' icon={History}>
							Tarix
						</NavLink>
						<NavLink href='/driver/settings' icon={Settings}>
							Sozlamalar
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
	const pathname = usePathname()
	const isActive = pathname === href || pathname.startsWith(href + '/')

	return (
		<Link
			href={href}
			className={`flex items-center space-x-2 py-4 border-b-2 transition-all duration-200 font-medium text-sm group ${isActive ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:border-blue-300 hover:text-blue-600'}`}
		>
			<Icon className='w-5 h-5 group-hover:scale-110 transition-transform' />
			<span>{children}</span>
		</Link>
	)
}
